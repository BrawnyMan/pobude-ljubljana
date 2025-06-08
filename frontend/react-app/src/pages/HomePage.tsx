import React, { useState } from 'react';
import MapView from '../components/MapView';
import InitiativeForm from '../components/InitiativeForm';

const HomePage = () => {
    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const handleLocationSelect = (lat: number, lng: number) => {
        setSelectedLocation({
            latitude: lat,
            longitude: lng
        });
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Map Section - Left side */}
                <div className="col-lg-8 p-0" style={{ height: 'calc(100vh - 56px)' }}>
                    <MapView
                        isSelectionMode={true}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
                
                {/* Form Section - Right side */}
                <div className="col-lg-4 py-3">
                    <InitiativeForm selectedLocation={selectedLocation} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
