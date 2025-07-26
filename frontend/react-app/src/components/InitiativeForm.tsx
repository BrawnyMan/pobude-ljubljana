import React, { useState, useEffect } from 'react';
import { createPobuda } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Popular Ljubljana streets
const LJUBLJANA_STREETS = [
    'Prešernova cesta',
    'Slovenska cesta',
    'Miklošičeva ulica',
    'Trubarjeva ulica',
    'Čopova ulica',
    'Wolfova ulica',
    'Kongresni trg',
    'Mestni trg',
    'Stritarjeva ulica',
    'Gosposka ulica',
    'Cankarjeva cesta',
    'Dunajska cesta',
    'Celovška cesta',
    'Vegova ulica',
    'Kardeljeva ploščad',
    'Tivolska cesta',
    'Masarykova cesta',
    'Bleiweisova cesta',
    'Šmartinska cesta',
    'Litijska cesta'
];

interface FormData {
  location: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  image: File | null;
  email: string;
  streetNumber: string;
}

interface InitiativeFormProps {
  selectedLocation: {
    latitude: number;
    longitude: number;
  } | null;
  onClearLocation?: () => void;
}

const InitiativeForm: React.FC<InitiativeFormProps> = ({ selectedLocation, onClearLocation }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    location: '',
    latitude: 46.0569, // Ljubljana center
    longitude: 14.5058,
    title: '',
    description: '',
    image: null,
    email: '',
    streetNumber: ''
  });

  // Update form data when location is selected on the map
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      }));
    }
  }, [selectedLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      
      // Set location based on whether coordinates are selected
      if (selectedLocation) {
        submitData.append('location', 'Selected location on map');
      } else {
        submitData.append('location', `${formData.location} ${formData.streetNumber}, Ljubljana`);
      }
      
      submitData.append('latitude', formData.latitude.toString());
      submitData.append('longitude', formData.longitude.toString());
      submitData.append('email', formData.email);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await createPobuda(submitData);
      navigate('/pobude');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the initiative');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Step 1: Location Details</h2>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location:</label>
              <div className="d-flex gap-2">
                <select
                  id="location"
                  name="location"
                  className="form-select"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required={!selectedLocation}
                  aria-describedby={!selectedLocation ? "location-help" : undefined}
                  disabled={isSubmitting}
                >
                  <option value="">Select a street</option>
                  {LJUBLJANA_STREETS.map((street) => (
                    <option key={street} value={street}>
                      {street}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  className="form-control"
                  style={{ width: '100px' }}
                  placeholder="No."
                  value={formData.streetNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, streetNumber: e.target.value }))}
                  required={!selectedLocation}
                  aria-describedby={!selectedLocation ? "location-help" : undefined}
                  disabled={isSubmitting}
                />
              </div>
              {!selectedLocation && (
                <div id="location-help" className="form-text">
                  Please select a street and enter the house number, or click on the map to select a location.
                </div>
              )}
            </div>
            {selectedLocation && (
              <div className="mb-3">
                <div className="text-muted mb-2">
                  Selected coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={onClearLocation}
                  disabled={isSubmitting}
                  aria-label="Remove map selection"
                >
                  Remove map selection
                </button>
              </div>
            )}
            {!selectedLocation && (
              <div className="alert alert-info" role="alert">
                Please click on the map to select a location or use the street input above
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Step 2: Initiative Details</h2>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                minLength={3}
                maxLength={100}
                aria-describedby="title-help"
                disabled={isSubmitting}
              />
              <div id="title-help" className="form-text">
                Enter a descriptive title for your initiative (3-100 characters)
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description:</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                minLength={10}
                maxLength={500}
                rows={4}
                aria-describedby="description-help"
                disabled={isSubmitting}
              ></textarea>
              <div id="description-help" className="form-text">
                Provide a detailed description of your initiative (10-500 characters)
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Image (optional):</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-control"
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                accept="image/*"
                aria-describedby="image-help"
                disabled={isSubmitting}
              />
              <div id="image-help" className="form-text">
                Upload an image to support your initiative (optional)
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Step 3: Contact Information</h2>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                aria-describedby="email-help"
                disabled={isSubmitting}
              />
              <div id="email-help" className="form-text">
                We'll use this email to contact you about your initiative
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        if (selectedLocation) {
          // If coordinates are selected, we don't need street/number
          return true;
        } else {
          // If no coordinates, we need both street and number
          return formData.location !== '' && formData.streetNumber !== '';
        }
      case 2:
        return formData.title.length >= 3 && formData.description.length >= 10;
      case 3:
        return formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      default:
        return false;
    }
  };

  return (
    <div className="container-fluid h-100 py-4">
      <form onSubmit={handleSubmit} role="form" aria-label="Initiative submission form">
        {renderStep()}
        
        {error && (
          <div className="alert alert-danger mb-3" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="d-flex justify-content-between">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(prev => prev - 1)}
              disabled={isSubmitting}
              aria-label="Go to previous step"
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary ms-auto"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!isStepValid() || isSubmitting}
              aria-label="Go to next step"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success ms-auto"
              disabled={!isStepValid() || isSubmitting}
              aria-describedby={isSubmitting ? "submitting-status" : undefined}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Initiative'}
            </button>
          )}
        </div>
        
        {isSubmitting && (
          <div id="submitting-status" className="visually-hidden" aria-live="polite">
            Submitting your initiative, please wait...
          </div>
        )}
      </form>
    </div>
  );
};

export default InitiativeForm; 