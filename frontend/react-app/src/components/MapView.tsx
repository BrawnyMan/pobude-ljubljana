import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { getPobude, Pobuda } from '../services/api';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';

const mapFocusStyles = `
  .leaflet-container,
  .leaflet-container *,
  .leaflet-marker-icon,
  .leaflet-popup,
  .leaflet-popup-content,
  .leaflet-popup-tip,
  .leaflet-control,
  .leaflet-control-zoom,
  .leaflet-control-attribution {
    outline: none !important;
    tab-index: -1 !important;
  }
  
  .leaflet-container:focus,
  .leaflet-container *:focus {
    outline: none !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = mapFocusStyles;
  if (!document.head.querySelector('style[data-map-focus]')) {
    styleElement.setAttribute('data-map-focus', 'true');
    document.head.appendChild(styleElement);
  }
}

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const LJUBLJANA_BOUNDS = new LatLngBounds(
    new LatLng(45.9774, 14.4276), 
    new LatLng(46.1674, 14.6276)  
);

const LJUBLJANA_CENTER: [number, number] = [46.0569, 14.5058];

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const pinIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
});

const answeredIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pendingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapViewProps {
    isSelectionMode: boolean;
    onLocationSelect?: (lat: number, lng: number) => void;
    focusLocation?: [number, number] | null;
}

const MapBoundsHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        map.setMaxBounds(LJUBLJANA_BOUNDS);
        map.setMinZoom(12);
        map.setMaxZoom(18);
        
        
        if (!LJUBLJANA_BOUNDS.contains(map.getCenter())) {
            map.setView(LJUBLJANA_CENTER, 13);
        }
    }, [map]);

    return null;
};

const MapFocus = ({ focusLocation }: { focusLocation: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
        if (focusLocation) {
            map.setView(focusLocation, 16);
        }
    }, [focusLocation, map]);

    return null;
};

const MapView: React.FC<MapViewProps> = ({ isSelectionMode, onLocationSelect, focusLocation }) => {
    const [pobude, setPobude] = useState<Pobuda[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!isSelectionMode) {
            fetchPobude();
        }
    }, [isSelectionMode]);

    const fetchPobude = async () => {
        try {
            const data = await getPobude();
            setPobude(data);
        } catch (error) {
            console.error('Error fetching pobude:', error);
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click: (e) => {
                if (isSelectionMode && onLocationSelect) {
                    const { lat, lng } = e.latlng;
                    setSelectedLocation([lat, lng]);
                    onLocationSelect(lat, lng);
                }
            },
        });
        return null;
    };

    return (
        <div 
            style={{ height: '100%', width: '100%' }}
            role="application"
            aria-label={isSelectionMode ? "Interaktivni zemljevid za izbiro lokacije" : "Zemljevid s prikazom vseh pobud"}
            tabIndex={-1}
        >
            <MapContainer
                center={[46.0569, 14.5058]} 
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                maxBounds={LJUBLJANA_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={12}
                maxZoom={18}
                tabIndex={-1}
            >
                <MapBoundsHandler />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents />
                <MapFocus focusLocation={focusLocation || null} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    tabIndex={-1}
                >
                    {pobude.map((pobuda) => {
                        if (
                            typeof pobuda.latitude !== 'number' || 
                            typeof pobuda.longitude !== 'number' ||
                            isNaN(pobuda.latitude) || 
                            isNaN(pobuda.longitude)
                        ) {
                            return null;
                        }

                        return (
                            <Marker
                                key={pobuda.id}
                                position={[pobuda.latitude, pobuda.longitude]}
                                icon={pobuda.status === 'odgovorjeno' ? answeredIcon : pendingIcon}
                                tabIndex={-1}
                            >
                                <Popup tabIndex={-1}>
                                    <div className="popup-content" tabIndex={-1}>
                                        <h3 className="h6">{pobuda.title}</h3>
                                        <p className="text-muted mb-2">
                                            <small>{pobuda.location}</small>
                                        </p>
                                        <p className="mb-2">{pobuda.description.substring(0, 100)}...</p>
                                        <span 
                                            className={`badge bg-${pobuda.status === 'v obravnavi' ? 'warning' : 'success'}`}
                                            aria-label={`Status: ${pobuda.status}`}
                                        >
                                            {pobuda.status}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>

                {isSelectionMode && selectedLocation && (
                    <Marker
                        position={selectedLocation}
                        icon={pinIcon}
                        tabIndex={-1}
                    >
                        <Popup tabIndex={-1}>
                            <div tabIndex={-1}>
                                <strong>Izbrana lokacija</strong><br />
                                Širina: {selectedLocation[0].toFixed(6)}<br />
                                Dolžina: {selectedLocation[1].toFixed(6)}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;
