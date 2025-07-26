import { useState } from 'react';
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

    const handleClearLocation = () => {
        setSelectedLocation(null);
    };

    return (
        <div className="container-fluid d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
            <div className="row flex-grow-1 min-h-0" style={{ minHeight: 0 }}>
                {/* Map Section - Left side */}
                <div className="col-lg-8 p-0 d-flex flex-grow-1" style={{ minHeight: '84vh' }}>
                    <MapView
                        isSelectionMode={true}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
                
                {/* Form Section - Right side */}
                <div className="col-lg-4 py-3">
                    <h1 className="visually-hidden">Submit New Initiative</h1>
                    <InitiativeForm 
                        selectedLocation={selectedLocation} 
                        onClearLocation={handleClearLocation}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
