from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from sqlmodel import Session, select
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, List
import os, shutil
import random
from .models import Pobuda, PobudaCreate, PobudaResponse, Statistics
from .database import engine

UPLOAD_DIR = "uploads"

# Ljubljana locations for random data
LJUBLJANA_LOCATIONS = [
    "Ljubljana Center", "Bežigrad", "Šiška", "Vič", "Moste",
    "Sostro", "Šentvid", "Rožnik", "Trnovo", "Polje"
]

# Random pobude data with realistic Ljubljana problems - 150 entries
RANDOM_POBUDE_DATA = [
    # Ceste - High volume, low response rate (problematic) - 40 entries
    {"title": "Broken sidewalk on Prešernova cesta", "description": "Large hole in sidewalk causing safety hazard", "category": "Ceste", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Street light not working on Miklošičeva", "description": "Dark area at night, safety concern", "category": "Ceste", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Damaged road surface on Celovška cesta", "description": "Potholes causing traffic issues", "category": "Ceste", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Broken bench in Tivoli Park", "description": "Bench needs repair for visitors", "category": "Parki in zelenice", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Damaged bus stop shelter", "description": "Glass broken, needs replacement", "category": "Avtobusna postajališča", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Broken water fountain", "description": "Fountain not working in park", "category": "Parki in zelenice", "location": "Trnovo", "status": "v obravnavi"},
    {"title": "Damaged playground equipment", "description": "Safety issue for children", "category": "Športne površine", "location": "Vič", "status": "v obravnavi"},
    {"title": "Broken street sign", "description": "Sign knocked down by vehicle", "category": "Ceste", "location": "Moste", "status": "v obravnavi"},
    {"title": "Damaged bike rack", "description": "Rack bent, unusable", "category": "Kolesarske poti", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Broken trash bin", "description": "Bin damaged, needs replacement", "category": "Razno", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Damaged pedestrian crossing", "description": "Crossing lights not working", "category": "Pešpoti in pločniki", "location": "Polje", "status": "v obravnavi"},
    {"title": "Broken public toilet", "description": "Toilet out of order", "category": "Razno", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Damaged bike path", "description": "Path surface damaged", "category": "Kolesarske poti", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Broken street furniture", "description": "Table damaged in park", "category": "Parki in zelenice", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Damaged public art", "description": "Sculpture needs repair", "category": "Kultura", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Broken drainage system", "description": "Water pooling on street", "category": "Ceste", "location": "Vič", "status": "v obravnavi"},
    {"title": "Damaged street curb", "description": "Curb broken, tripping hazard", "category": "Ceste", "location": "Moste", "status": "v obravnavi"},
    {"title": "Broken traffic barrier", "description": "Barrier damaged by accident", "category": "Ceste", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Damaged bus shelter glass", "description": "Glass shattered, dangerous", "category": "Avtobusna postajališča", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Broken street lamp post", "description": "Lamp post leaning dangerously", "category": "Ceste", "location": "Polje", "status": "v obravnavi"},
    {"title": "Damaged bike lane marking", "description": "Lane markings faded", "category": "Kolesarske poti", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Broken park gate", "description": "Gate not closing properly", "category": "Parki in zelenice", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Damaged sidewalk tiles", "description": "Tiles loose and broken", "category": "Pešpoti in pločniki", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Broken street name sign", "description": "Sign missing letters", "category": "Ceste", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Damaged public bench", "description": "Bench slats broken", "category": "Parki in zelenice", "location": "Vič", "status": "v obravnavi"},
    {"title": "Broken water meter cover", "description": "Cover missing, safety hazard", "category": "Vodovod", "location": "Moste", "status": "v obravnavi"},
    {"title": "Damaged street tree guard", "description": "Tree guard damaged", "category": "Drevesa, rastje in zelene površine", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Broken bus stop sign", "description": "Sign knocked over", "category": "Avtobusna postajališča", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Damaged pedestrian bridge", "description": "Bridge railing loose", "category": "Pešpoti in pločniki", "location": "Polje", "status": "v obravnavi"},
    {"title": "Broken street drain cover", "description": "Cover cracked, dangerous", "category": "Ceste", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Damaged bike path barrier", "description": "Barrier broken", "category": "Kolesarske poti", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Broken park fence", "description": "Fence section missing", "category": "Parki in zelenice", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Damaged street light pole", "description": "Pole bent, unsafe", "category": "Ceste", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Broken public trash can", "description": "Can lid broken", "category": "Razno", "location": "Vič", "status": "v obravnavi"},
    {"title": "Damaged sidewalk ramp", "description": "Ramp surface damaged", "category": "Pešpoti in pločniki", "location": "Moste", "status": "v obravnavi"},
    {"title": "Broken street tree", "description": "Tree fallen, blocking path", "category": "Drevesa, rastje in zelene površine", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Damaged bus stop bench", "description": "Bench seat broken", "category": "Avtobusna postajališča", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Broken street sign post", "description": "Post bent, sign hanging", "category": "Ceste", "location": "Polje", "status": "v obravnavi"},
    {"title": "Damaged bike rack bolts", "description": "Bolts loose, rack unstable", "category": "Kolesarske poti", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Broken park water tap", "description": "Tap leaking, wasting water", "category": "Vodovod", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Damaged street gutter", "description": "Gutter clogged, flooding", "category": "Ceste", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Broken public toilet door", "description": "Door lock broken", "category": "Razno", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Damaged street corner mirror", "description": "Mirror cracked, unsafe", "category": "Ceste", "location": "Vič", "status": "v obravnavi"},
    {"title": "Broken bike path surface", "description": "Surface cracked and uneven", "category": "Kolesarske poti", "location": "Moste", "status": "v obravnavi"},
    {"title": "Damaged street tree roots", "description": "Roots lifting sidewalk", "category": "Drevesa, rastje in zelene površine", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Broken bus stop roof", "description": "Roof leaking", "category": "Avtobusna postajališča", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Damaged street light cover", "description": "Cover missing, exposed wiring", "category": "Ceste", "location": "Polje", "status": "v obravnavi"},
    
    # LPP - Medium volume, medium response rate - 30 entries
    {"title": "Bus schedule issues on route 1", "description": "Buses frequently late", "category": "LPP", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Parking problems in city center", "description": "No available parking spaces", "category": "Mirujoči promet", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Bike lane blocked by construction", "description": "Cyclists forced onto road", "category": "Kolesarske poti", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Traffic light timing issues", "description": "Lights too short for pedestrians", "category": "Ceste", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Bus stop accessibility", "description": "No ramp for wheelchair users", "category": "Avtobusna postajališča", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Bike theft prevention needed", "description": "More secure bike racks", "category": "Kolesarske poti", "location": "Moste", "status": "v obravnavi"},
    {"title": "Public transport frequency", "description": "More buses needed during peak hours", "category": "LPP", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Pedestrian crossing safety", "description": "Crossing too dangerous", "category": "Pešpoti in pločniki", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Bike path maintenance", "description": "Path needs cleaning", "category": "Kolesarske poti", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Bus route optimization", "description": "Route changes needed", "category": "LPP", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Traffic congestion on main street", "description": "Heavy traffic during rush hour", "category": "Ceste", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Bike lane width too narrow", "description": "Lane too narrow for safe cycling", "category": "Kolesarske poti", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Bus stop location inconvenient", "description": "Stop too far from destination", "category": "Avtobusna postajališča", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Traffic signal malfunction", "description": "Signal stuck on red", "category": "Ceste", "location": "Vič", "status": "v obravnavi"},
    {"title": "Bike path connection missing", "description": "Gap in bike network", "category": "Kolesarske poti", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Public transport reliability", "description": "Buses often delayed", "category": "LPP", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Pedestrian zone enforcement", "description": "Cars driving in pedestrian area", "category": "Javni red in mir", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Bike sharing station empty", "description": "No bikes available", "category": "Kolesarske poti", "location": "Polje", "status": "v obravnavi"},
    {"title": "Bus driver behavior", "description": "Aggressive driving reported", "category": "LPP", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Traffic calming measures needed", "description": "Speed bumps required", "category": "Umiritev prometa in varnost", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Bike lane surface quality", "description": "Surface rough and bumpy", "category": "Kolesarske poti", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Public transport information", "description": "Real-time updates needed", "category": "LPP", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Pedestrian bridge maintenance", "description": "Bridge needs repair", "category": "Pešpoti in pločniki", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Bike path lighting", "description": "Path too dark at night", "category": "Kolesarske poti", "location": "Moste", "status": "v obravnavi"},
    {"title": "Bus stop shelter design", "description": "Shelter not weatherproof", "category": "Avtobusna postajališča", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Traffic flow optimization", "description": "Traffic patterns inefficient", "category": "Ceste", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Bike lane intersection safety", "description": "Dangerous intersection", "category": "Kolesarske poti", "location": "Polje", "status": "v obravnavi"},
    {"title": "Public transport accessibility", "description": "Low-floor buses needed", "category": "LPP", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Pedestrian walkway width", "description": "Sidewalk too narrow", "category": "Pešpoti in pločniki", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Bike path winter maintenance", "description": "Path not cleared of snow", "category": "Kolesarske poti", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Bus route coverage gaps", "description": "Areas not served by buses", "category": "LPP", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Traffic sign visibility", "description": "Signs hidden by vegetation", "category": "Ceste", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Bike lane continuity", "description": "Lane ends abruptly", "category": "Kolesarske poti", "location": "Moste", "status": "v obravnavi"},
    {"title": "Public transport integration", "description": "Poor connection between modes", "category": "LPP", "location": "Sostro", "status": "odgovorjeno"},
    
    # Drevesa, rastje in zelene površine - High volume, high response rate (good) - 35 entries
    {"title": "Tree planting in neighborhood", "description": "More trees needed for shade", "category": "Drevesa, rastje in zelene površine", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Recycling bin placement", "description": "More recycling bins needed", "category": "Razno", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Green space maintenance", "description": "Park needs better care", "category": "Parki in zelenice", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Air quality monitoring", "description": "Install air quality sensors", "category": "Razno", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Water conservation", "description": "Install water-saving devices", "category": "Vodovod", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Solar panel installation", "description": "Solar panels on public buildings", "category": "Razno", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Bike sharing expansion", "description": "More bike sharing stations", "category": "Kolesarske poti", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Community garden creation", "description": "New community garden space", "category": "Parki in zelenice", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Electric vehicle charging", "description": "More EV charging stations", "category": "Razno", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Waste reduction program", "description": "Composting facilities needed", "category": "Razno", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Bird sanctuary creation", "description": "Protect local bird species", "category": "Drevesa, rastje in zelene površine", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Green roof installation", "description": "Green roofs on buildings", "category": "Razno", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Water fountain repair", "description": "Drinking fountains not working", "category": "Vodovod", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Native plant restoration", "description": "Restore native vegetation", "category": "Drevesa, rastje in zelene površine", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Energy efficiency program", "description": "LED street lighting", "category": "Ceste", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Urban beekeeping initiative", "description": "Install beehives in parks", "category": "Drevesa, rastje in zelene površine", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Rainwater harvesting", "description": "Collect rainwater for irrigation", "category": "Vodovod", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Green wall installation", "description": "Vertical gardens on buildings", "category": "Drevesa, rastje in zelene površine", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Composting program", "description": "Community composting facilities", "category": "Razno", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Wildlife corridor creation", "description": "Connect green spaces", "category": "Drevesa, rastje in zelene površine", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Sustainable drainage", "description": "Natural water filtration", "category": "Vodovod", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Urban forest expansion", "description": "Plant more trees", "category": "Drevesa, rastje in zelene površine", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Renewable energy integration", "description": "Solar and wind power", "category": "Razno", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Green transportation hub", "description": "Eco-friendly transport center", "category": "LPP", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Biodiversity protection", "description": "Protect local ecosystems", "category": "Drevesa, rastje in zelene površine", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Carbon footprint reduction", "description": "City-wide sustainability plan", "category": "Razno", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Green building standards", "description": "Eco-friendly construction", "category": "Razno", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Waste sorting education", "description": "Better recycling awareness", "category": "Razno", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Urban agriculture", "description": "Community farming spaces", "category": "Drevesa, rastje in zelene površine", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Clean energy transition", "description": "Switch to renewable sources", "category": "Razno", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Water quality monitoring", "description": "Test local water sources", "category": "Vodovod", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Green infrastructure", "description": "Natural flood protection", "category": "Vodovod", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Sustainable mobility", "description": "Eco-friendly transport options", "category": "Kolesarske poti", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Environmental education", "description": "Sustainability workshops", "category": "Razno", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Green space connectivity", "description": "Connect parks and gardens", "category": "Parki in zelenice", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Climate action plan", "description": "Local climate initiatives", "category": "Razno", "location": "Rožnik", "status": "odgovorjeno"},
    
    # Kultura - Medium volume, high response rate - 20 entries
    {"title": "Public art installation", "description": "New sculpture in park", "category": "Kultura", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Cultural festival organization", "description": "Annual neighborhood festival", "category": "Kultura", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Library hours extension", "description": "Longer opening hours", "category": "Razno", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Museum accessibility", "description": "Better access for disabled", "category": "Kultura", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Music venue creation", "description": "New music performance space", "category": "Kultura", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Art workshop space", "description": "Community art studio", "category": "Kultura", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Historical preservation", "description": "Protect historic buildings", "category": "Kultura", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Cultural center renovation", "description": "Update cultural facilities", "category": "Kultura", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Film screening events", "description": "Outdoor movie nights", "category": "Kultura", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Theater accessibility", "description": "Better theater access", "category": "Kultura", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Street performance permits", "description": "Support local artists", "category": "Kultura", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Cultural heritage tours", "description": "Guided historical walks", "category": "Kultura", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Art gallery expansion", "description": "More exhibition space", "category": "Kultura", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Music education programs", "description": "Community music classes", "category": "Kultura", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Cultural exchange programs", "description": "International partnerships", "category": "Kultura", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Public reading spaces", "description": "Outdoor libraries", "category": "Razno", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Cultural diversity events", "description": "Celebrate different cultures", "category": "Kultura", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Art in public spaces", "description": "More public art displays", "category": "Kultura", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Cultural workshop facilities", "description": "Community learning spaces", "category": "Kultura", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Traditional craft preservation", "description": "Support local artisans", "category": "Kultura", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Cultural performance venues", "description": "More performance spaces", "category": "Kultura", "location": "Šiška", "status": "odgovorjeno"},
    
    # Razno - Low volume, high response rate - 10 entries
    {"title": "School playground upgrade", "description": "Better playground equipment", "category": "Športne površine", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Library book collection", "description": "More books for children", "category": "Razno", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Computer lab improvement", "description": "New computers for students", "category": "Informatika", "location": "Vič", "status": "odgovorjeno"},
    {"title": "School safety measures", "description": "Better school security", "category": "Razno", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Learning center creation", "description": "New study space", "category": "Razno", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Adult education programs", "description": "Lifelong learning opportunities", "category": "Razno", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Digital literacy classes", "description": "Computer skills training", "category": "Informatika", "location": "Polje", "status": "odgovorjeno"},
    {"title": "Language learning center", "description": "Multilingual education", "category": "Razno", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "STEM education facilities", "description": "Science and technology labs", "category": "Informatika", "location": "Ljubljana Center", "status": "odgovorjeno"},
    {"title": "Creative arts education", "description": "Art and music programs", "category": "Kultura", "location": "Bežigrad", "status": "odgovorjeno"},
    
    # Socialno varstvo in zdravje - Low volume, medium response rate - 10 entries
    {"title": "Sports facility upgrade", "description": "Better gym equipment", "category": "Športne površine", "location": "Šentvid", "status": "odgovorjeno"},
    {"title": "Walking path creation", "description": "New walking trails", "category": "Pešpoti in pločniki", "location": "Polje", "status": "v obravnavi"},
    {"title": "Fitness equipment installation", "description": "Outdoor gym equipment", "category": "Športne površine", "location": "Rožnik", "status": "odgovorjeno"},
    {"title": "Health clinic accessibility", "description": "Better clinic access", "category": "Socialno varstvo in zdravje", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "Mental health support", "description": "Counseling services", "category": "Socialno varstvo in zdravje", "location": "Bežigrad", "status": "odgovorjeno"},
    {"title": "Senior fitness programs", "description": "Exercise classes for elderly", "category": "Socialno varstvo in zdravje", "location": "Šiška", "status": "odgovorjeno"},
    {"title": "Children's health activities", "description": "Youth fitness programs", "category": "Socialno varstvo in zdravje", "location": "Vič", "status": "v obravnavi"},
    {"title": "Wellness center creation", "description": "Holistic health facility", "category": "Socialno varstvo in zdravje", "location": "Moste", "status": "odgovorjeno"},
    {"title": "Nutrition education", "description": "Healthy eating workshops", "category": "Socialno varstvo in zdravje", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Preventive health programs", "description": "Health screening services", "category": "Socialno varstvo in zdravje", "location": "Šentvid", "status": "odgovorjeno"},
    
    # Javni red in mir - Medium volume, low response rate (problematic) - 10 entries
    {"title": "Street lighting improvement", "description": "Better lighting for safety", "category": "Ceste", "location": "Šiška", "status": "v obravnavi"},
    {"title": "Security camera installation", "description": "Cameras for crime prevention", "category": "Javni red in mir", "location": "Vič", "status": "v obravnavi"},
    {"title": "Emergency response time", "description": "Faster emergency services", "category": "Javni red in mir", "location": "Moste", "status": "v obravnavi"},
    {"title": "Police patrol frequency", "description": "More police presence", "category": "Javni red in mir", "location": "Sostro", "status": "v obravnavi"},
    {"title": "Fire safety measures", "description": "Better fire protection", "category": "Javni red in mir", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Traffic safety improvement", "description": "Safer traffic conditions", "category": "Ceste", "location": "Polje", "status": "v obravnavi"},
    {"title": "Pedestrian safety", "description": "Better pedestrian protection", "category": "Pešpoti in pločniki", "location": "Rožnik", "status": "v obravnavi"},
    {"title": "Bike safety measures", "description": "Safer cycling conditions", "category": "Kolesarske poti", "location": "Ljubljana Center", "status": "v obravnavi"},
    {"title": "School safety upgrade", "description": "Better school security", "category": "Javni red in mir", "location": "Bežigrad", "status": "v obravnavi"},
    {"title": "Public safety awareness", "description": "Safety education programs", "category": "Javni red in mir", "location": "Šiška", "status": "v obravnavi"},
    
    # Other - Low volume, mixed response rate - 5 entries
    {"title": "WiFi in public spaces", "description": "Free WiFi in parks", "category": "Informatika", "location": "Vič", "status": "odgovorjeno"},
    {"title": "Public restroom maintenance", "description": "Better restroom facilities", "category": "Razno", "location": "Moste", "status": "v obravnavi"},
    {"title": "Information kiosk installation", "description": "Tourist information points", "category": "Razno", "location": "Sostro", "status": "odgovorjeno"},
    {"title": "Community notice board", "description": "Public notice boards", "category": "Razno", "location": "Šentvid", "status": "v obravnavi"},
    {"title": "Public seating areas", "description": "More benches and seating", "category": "Parki in zelenice", "location": "Polje", "status": "odgovorjeno"}
]

def generate_random_pobude():
    """Generate random pobude data with realistic Ljubljana problems"""
    with Session(engine) as session:
        # Clear existing data
        pobude_to_delete = session.exec(select(Pobuda)).all()
        for pobuda in pobude_to_delete:
            session.delete(pobuda)
        session.commit()
        
        # Add random pobude
        for pobuda_data in RANDOM_POBUDE_DATA:
            # Add some randomness to status (some responded, some pending)
            if random.random() < 0.3:  # 30% chance to be responded
                pobuda_data["status"] = "odgovorjeno"
            
            # Add random coordinates within Ljubljana
            latitude = 46.0569 + random.uniform(-0.01, 0.01)
            longitude = 14.5058 + random.uniform(-0.01, 0.01)
            
            # Add random email
            email = f"citizen{random.randint(1, 999)}@ljubljana.si"
            
            pobuda = Pobuda(
                title=pobuda_data["title"],
                description=pobuda_data["description"],
                location=pobuda_data["location"],
                latitude=latitude,
                longitude=longitude,
                email=email,
                category=pobuda_data["category"],
                status=pobuda_data["status"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180))
            )
            
            # If responded, add response time
            if pobuda.status == "odgovorjeno":
                pobuda.responded_at = pobuda.created_at + timedelta(days=random.randint(1, 30))
                pobuda.response = f"Thank you for your initiative. We are working on this issue and will provide updates soon."
            
            session.add(pobuda)
        
        session.commit()
        return len(RANDOM_POBUDE_DATA)

router = APIRouter()

@router.post("/api/pobude", response_model=Pobuda)
async def create_pobuda(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    email: str = Form(...),
    category: str = Form(default="other"),
    image: Optional[UploadFile] = File(None)
):
    # Handle image upload
    image_path = None
    if image:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"pobuda_{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_path = f"/uploads/{filename}"

    pobuda = Pobuda(
        title=title,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        email=email,
        category=category,
        image_path=image_path
    )
    with Session(engine) as session:
        session.add(pobuda)
        session.commit()
        session.refresh(pobuda)
        return pobuda

@router.get("/api/pobude/{pobuda_id}", response_model=Pobuda)
def get_pobuda(pobuda_id: int):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        return pobuda

@router.get("/api/pobude", response_model=List[Pobuda])
def get_pobude():
    with Session(engine) as session:
        pobude = session.exec(select(Pobuda)).all()
        return pobude

@router.put("/api/pobude/{pobuda_id}/respond", response_model=Pobuda)
def respond_to_pobuda(pobuda_id: int, response_data: PobudaResponse):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        pobuda.response = response_data.response
        pobuda.status = "odgovorjeno"
        pobuda.responded_at = datetime.utcnow()
        session.add(pobuda)
        session.commit()
        session.refresh(pobuda)
        return pobuda

@router.get("/api/admin/statistics", response_model=Statistics)
def get_statistics():
    with Session(engine) as session:
        pobude = session.exec(select(Pobuda)).all()
        total_pobude = len(pobude)
        pending_pobude = sum(1 for p in pobude if p.status == "v obravnavi")
        responded_pobude = sum(1 for p in pobude if p.status == "odgovorjeno")
        today = datetime.utcnow().date()
        thirty_days_ago = today - timedelta(days=30)
        daily_stats = []
        response_stats = []
        daily_counts = defaultdict(int)
        response_counts = defaultdict(int)
        for pobuda in pobude:
            created_date = pobuda.created_at.date()
            if created_date >= thirty_days_ago:
                daily_counts[created_date] += 1
            if pobuda.responded_at:
                response_date = pobuda.responded_at.date()
                if response_date >= thirty_days_ago:
                    response_counts[response_date] += 1
        for i in range(30):
            date = today - timedelta(days=i)
            daily_stats.append({"date": date.isoformat(), "count": daily_counts[date]})
            response_stats.append({"date": date.isoformat(), "count": response_counts[date]})
        daily_stats.reverse()
        response_stats.reverse()
        return Statistics(
            total_pobude=total_pobude,
            pending_pobude=pending_pobude,
            responded_pobude=responded_pobude,
            daily_stats=daily_stats,
            response_stats=response_stats
        )

@router.post("/api/generate-random-data")
def generate_random_data():
    """Generate random pobude data for testing and demonstration"""
    try:
        count = generate_random_pobude()
        return {"message": f"Generated {count} random pobude with realistic Ljubljana problems", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating random data: {str(e)}") 