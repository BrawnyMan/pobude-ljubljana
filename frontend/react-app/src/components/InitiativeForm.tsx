import React, { useState, useEffect } from 'react';
import { createPobuda } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MapView from './MapView';

interface FormData {
  location: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  image: File | null;
  email: string;
}

interface InitiativeFormProps {
  selectedLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const InitiativeForm: React.FC<InitiativeFormProps> = ({ selectedLocation }) => {
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
    email: ''
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
      submitData.append('location', formData.location);
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
            <h4 className="mb-3">Step 1: Location Details</h4>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location Description:</label>
              <input
                type="text"
                id="location"
                className="form-control mb-3"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location description"
                required
              />
            </div>
            <div className="text-muted mb-3">
              Selected coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </div>
            {!selectedLocation && (
              <div className="alert alert-info">
                Please click on the map to select a location
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="mb-4">
            <h4 className="mb-3">Step 2: Initiative Details</h4>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title:</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description:</label>
              <textarea
                id="description"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Image (optional):</label>
              <input
                type="file"
                id="image"
                className="form-control"
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                accept="image/*"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mb-4">
            <h4 className="mb-3">Step 3: Contact Information</h4>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
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
        return formData.location !== '' && selectedLocation !== null;
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
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        <div className="d-flex justify-content-between">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(prev => prev - 1)}
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary ms-auto"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!isStepValid()}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success ms-auto"
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Initiative'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InitiativeForm; 