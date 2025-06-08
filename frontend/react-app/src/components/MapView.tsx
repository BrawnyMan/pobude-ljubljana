import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, DivIcon, LatLngBounds, LatLng } from 'leaflet';
import { getPobude, Pobuda } from '../services/api';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

// Ljubljana bounds
const LJUBLJANA_BOUNDS = new LatLngBounds(
    new LatLng(45.9774, 14.4276), // Southwest corner
    new LatLng(46.1674, 14.6276)  // Northeast corner
);

// Ljubljana center
const LJUBLJANA_CENTER: [number, number] = [46.0569, 14.5058];

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Pin marker icon for selection
const pinIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
});

// Circle icon for existing initiatives
const circleIcon = new DivIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #007bff; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
    popupAnchor: [1, -7]
});

interface MapViewProps {
    onLocationSelect?: (lat: number, lng: number) => void;
    isSelectionMode?: boolean;
}

// MapBoundsHandler component to restrict map movement
const MapBoundsHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        map.setMaxBounds(LJUBLJANA_BOUNDS);
        map.setMinZoom(12);
        map.setMaxZoom(18);
        
        // If current view is outside bounds, pan to Ljubljana center
        if (!LJUBLJANA_BOUNDS.contains(map.getCenter())) {
            map.setView(LJUBLJANA_CENTER, 13);
        }
    }, [map]);

    return null;
};

// MapClickHandler component to handle click events
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => {
            // Only allow selection within Ljubljana bounds
            if (LJUBLJANA_BOUNDS.contains(e.latlng)) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const MapView: React.FC<MapViewProps> = ({ onLocationSelect, isSelectionMode = false }) => {
    const [initiatives, setInitiatives] = useState<Pobuda[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        const fetchInitiatives = async () => {
            try {
                const data = await getPobude();
                const validInitiatives = data.filter(
                    initiative => 
                        typeof initiative.latitude === 'number' && 
                        typeof initiative.longitude === 'number' &&
                        !isNaN(initiative.latitude) && 
                        !isNaN(initiative.longitude)
                );
                setInitiatives(validInitiatives);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch initiatives');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitiatives();
    }, []);

    const handleLocationSelect = (lat: number, lng: number) => {
        if (isSelectionMode && onLocationSelect) {
            setSelectedLocation([lat, lng]);
            onLocationSelect(lat, lng);
        }
    };

    if (isLoading) {
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="alert alert-danger">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={LJUBLJANA_CENTER}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                maxBounds={LJUBLJANA_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={12}
                maxZoom={18}
            >
                <MapBoundsHandler />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Existing initiatives */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {initiatives.map((initiative) => {
                        if (
                            typeof initiative.latitude !== 'number' || 
                            typeof initiative.longitude !== 'number' ||
                            isNaN(initiative.latitude) || 
                            isNaN(initiative.longitude)
                        ) {
                            return null;
                        }

                        return (
                            <Marker
                                key={initiative.id}
                                position={[initiative.latitude, initiative.longitude]}
                                icon={circleIcon}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h5>{initiative.title}</h5>
                                        <p className="text-muted mb-2">
                                            <small>{initiative.location}</small>
                                        </p>
                                        <p className="mb-2">{initiative.description.substring(0, 100)}...</p>
                                        <span className={`badge bg-${initiative.status === 'v obravnavi' ? 'warning' : 'success'}`}>
                                            {initiative.status}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>

                {/* Selection mode handler and marker */}
                {isSelectionMode && onLocationSelect && (
                    <>
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        {selectedLocation && (
                            <Marker
                                position={selectedLocation}
                                icon={pinIcon}
                            >
                                <Popup>
                                    Selected Location<br />
                                    Lat: {selectedLocation[0].toFixed(6)}<br />
                                    Lng: {selectedLocation[1].toFixed(6)}
                                </Popup>
                            </Marker>
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;
