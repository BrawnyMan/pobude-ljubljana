import json
from datetime import datetime
from pyproj import Transformer
import random

transformer = Transformer.from_crs("EPSG:3794", "EPSG:4326", always_xy=True)

possible_responses = [
    "Vaša pobuda je bila obravnavana in ustrezno rešena.",
    "Hvala za vašo pobudo. Težava je bila odpravljena.",
    "Pobuda je trenutno v obravnavi, vendar je delno rešena.",
    "Zadevo smo predali pristojnemu oddelku.",
    "Težava je bila preverjena in ustrezno ukrepana.",
    "Odgovor: pobuda je bila sprejeta in zaključena."
]

category_map = {
    39: "Avtobusna postajališča",
    112: "BicikeLJ",
    2: "Ceste",
    109: "Delo inšpekcij",
    110: "Delo Mestnega redarstva",
    215: "Delovanje lokalne samouprave",
    60: "Drevesa, rastje in zelene površine",
    218: "Energetsko upravljanje",
    219: "Evropski projekti",
    138: "Informatika",
    66: "Invazivne rastline",
    67: "Invazivne živali",
    164: "Javne prireditve",
    94: "Javne sanitarije",
    111: "Javni prevoz",
    159: "Javni red in mir",
    6: "Kolesarske poti",
    99: "Kultura",
    115: "LPP",
    13: "Mirujoči promet",
    93: "Napeljava plinovoda ",
    89: "Občinski domovi prostori itd",
    123: "Odpadki",
    87: "Oglaševanje ",
    84: "Ostala infrastruktura",
    216: "Otroška igrišča",
    79: "Parki in zelenice",
    35: "Pešpoti in pločniki",
    88: "Pokopališča",
    150: "Poraba sredstev",
    142: "Pritožbe nad delom MU",
    212: "Razno",
    201: "Socialno varstvo in zdravje",
    191: "Splošno MU MOL",
    182: "Stanovanjska problematika",
    108: "Storitve MOL",
    81: "Svetila",
    217: "Športne površine",
    7: "Umiritev prometa in varnost",
    144: "Upravna vprašanja",
    183: "Urejanje prostora",
    52: "Vodnjaki in pitniki",
    55: "Vodovod",
    28: "Vzdrževanje cest",
    151: "Vzgoja in izobraževanje",
    46: "Zapore cest"
}

def convert_pobude(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    results = []
    for feature in data["features"]:
        attributes = feature["attributes"]
        geometry = feature["geometry"]

        lon, lat = transformer.transform(geometry["x"], geometry["y"])

        category_id = attributes.get("MOL_VRSTE_POBUD_ID")
        category = category_map.get(category_id, "other")

        pobuda = {
            "title": attributes.get("NASLOV_POBUDE", "Neznan naslov"),
            "description": attributes.get("VSEBINA", ""),
            "location": "Ljubljana",
            "latitude": lat,
            "longitude": lon,
            "email": attributes.get("UPORABNIK_MOL", "unknown@example.com"),
            "category": category,
            "image_path": None,
            "status": "odgovorjeno" if attributes.get("STATUS_POBUDE") == 2 else "v obravnavi",
            "created_at": datetime.utcfromtimestamp(attributes["DATUM_VNOSA"] / 1000).isoformat(),
            "response": random.choice(possible_responses) if attributes.get("DATUM_ZADNJEGA_ODGOVORA") else None,
            "responded_at": datetime.utcfromtimestamp(attributes["DATUM_ZADNJEGA_ODGOVORA"] / 1000).isoformat()
            if attributes.get("DATUM_ZADNJEGA_ODGOVORA") else None
        }

        results.append(pobuda)

    with open(output_file, "w", encoding="utf-8") as out:
        json.dump(results, out, ensure_ascii=False, indent=2)

    print(f"Pretvorjenih {len(results)} pobud in shranjenih v {output_file}")

if __name__ == "__main__":
    convert_pobude("data1.json", "data1_converted.json")
    convert_pobude("data2.json", "data2_converted.json")
    convert_pobude("data3.json", "data3_converted.json")
