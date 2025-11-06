import React, { useState, useEffect } from 'react';
import { createPobuda } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { searchStreets } from '../services/api';

interface FormData {
  location: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  image: File | null;
  email: string;
  streetNumber: string;
  category: string;
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
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    location: '',
    latitude: 46.0569, 
    longitude: 14.5058,
    title: '',
    description: '',
    image: null,
    email: '',
    streetNumber: '',
    category: ''
  });

  const [streetQuery, setStreetQuery] = useState('');
  const [streetOptions, setStreetOptions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [streetError, setStreetError] = useState<string | null>(null);

  
  useEffect(() => {
    if (!streetQuery || streetQuery.trim().length < 2) {
      setStreetOptions([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setStreetError(null);
        const results = await searchStreets(streetQuery, 20);
        setStreetOptions(results);
      } catch (err) {
        setStreetError('Napaka pri iskanju ulic');
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [streetQuery]);

  
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
      
      
      if (selectedLocation) {
        submitData.append('location', 'Izbrana lokacija na zemljevidu');
      } else {
        submitData.append('location', `${formData.location} ${formData.streetNumber}, Ljubljana`);
      }
      
      submitData.append('latitude', formData.latitude.toString());
      submitData.append('longitude', formData.longitude.toString());
      submitData.append('email', formData.email);
      submitData.append('category', formData.category || 'other');
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await createPobuda(submitData);
      navigate('/pobude');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pri oddaji pobude je prišlo do napake');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Korak 1: Podrobnosti lokacije</h2>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Lokacija:</label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1 position-relative">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="Začnite tipkati ime ulice…"
                    value={streetQuery}
                    onChange={(e) => setStreetQuery(e.target.value)}
                    onBlur={() => {
                      
                      if (!formData.location && streetQuery) {
                        setFormData(prev => ({ ...prev, location: streetQuery }));
                      }
                    }}
                    required={!selectedLocation}
                    aria-describedby={!selectedLocation ? "location-help" : undefined}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  {(streetOptions.length > 0 || isSearching) && (
                    <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: '240px', overflowY: 'auto' }}>
                      {isSearching && (
                        <div className="list-group-item text-muted small">Iskanje…</div>
                      )}
                      {!isSearching && streetOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          className="list-group-item list-group-item-action"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, location: opt }));
                            setStreetQuery(opt);
                            setStreetOptions([]);
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                      {!isSearching && streetOptions.length === 0 && streetQuery.length >= 2 && (
                        <div className="list-group-item text-muted small">Ni zadetkov</div>
                      )}
                    </div>
                  )}
                  {streetError && (
                    <div className="form-text text-danger">{streetError}</div>
                  )}
                </div>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  className="form-control"
                  style={{ width: '100px' }}
                  placeholder="Št."
                  value={formData.streetNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, streetNumber: e.target.value }))}
                  required={!selectedLocation}
                  aria-describedby={!selectedLocation ? "location-help" : undefined}
                  disabled={isSubmitting}
                />
              </div>
              {!selectedLocation && (
                <div id="location-help" className="form-text">
                  Izberite ulico in vnesite hišno številko ali kliknite na zemljevid, da izberete lokacijo.
                </div>
              )}
            </div>
            {selectedLocation && (
              <div className="mb-3">
                <div className="text-muted mb-2">
                  Izbrane koordinate: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={onClearLocation}
                  disabled={isSubmitting}
                  aria-label="Odstrani izbiro na zemljevidu"
                >
                  Odstrani izbiro na zemljevidu
                </button>
              </div>
            )}
            {!selectedLocation && (
              <div className="alert alert-info" role="alert">
                Kliknite na zemljevid, da izberete lokacijo, ali uporabite vnos ulice zgoraj
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Korak 2: Podrobnosti pobude</h2>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Naslov:</label>
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
                Vnesite opisni naslov pobude (3–100 znakov)
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Kategorija:</label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
                aria-describedby="category-help"
                disabled={isSubmitting}
              >
                <option value="">Izberite kategorijo</option>
                <option value="ceste">Ceste</option>
                <option value="drevesa_rastje_zelene">Drevesa, rastje in zelene površine</option>
                <option value="parki_zelene">Parki in zelenice</option>
                <option value="javni_red_mir">Javni red in mir</option>
                <option value="delo_redarstva">Delo Mestnega redarstva</option>
                <option value="vzdrzevanje_cest">Vzdrževanje cest</option>
                <option value="kolesarske_poti">Kolesarske poti</option>
                <option value="lpp">LPP</option>
                <option value="pespoti_plocniki">Pešpoti in pločniki</option>
                <option value="razno">Razno</option>
                <option value="umiritev_prometa">Umiritev prometa in varnost</option>
                <option value="vodovod">Vodovod</option>
                <option value="kultura">Kultura</option>
                <option value="delo_inspekcij">Delo inšpekcij</option>
                <option value="avtobusna_postajalisca">Avtobusna postajališča</option>
                <option value="oglaševanje">Oglaševanje </option>
                <option value="sportne_povrsine">Športne površine</option>
                <option value="mirujoci_promet">Mirujoči promet</option>
                <option value="socialno_varstvo">Socialno varstvo in zdravje</option>
                <option value="informatika">Informatika</option>
                <option value="other">Drugo</option>
              </select>
              <div id="category-help" className="form-text">
                Izberite kategorijo, ki najbolje opisuje vašo pobudo
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Opis:</label>
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
                Podajte podroben opis vaše pobude (10–500 znakov)
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Slika (neobvezno):</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="file"
                  id="image"
                  name="image"
                  className="form-control visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, image: file }));
                    setSelectedFileName(file ? file.name : '');
                  }}
                  accept="image/*"
                  aria-describedby="image-help"
                  disabled={isSubmitting}
                />
                <label htmlFor="image" className="btn btn-outline-primary mb-0" aria-label="Izberi datoteko">
                  Izberi datoteko
                </label>
                <span className="text-muted small" aria-live="polite">
                  {selectedFileName || 'Datoteka ni izbrana'}
                </span>
              </div>
              <div id="image-help" className="form-text">
                Naložite sliko, ki podpira vašo pobudo (neobvezno)
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mb-4">
            <h2 className="mb-3">Korak 3: Kontaktni podatki</h2>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-pošta:</label>
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
                Ta e-poštni naslov bomo uporabili za stik v zvezi z vašo pobudo
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
          
          return true;
        } else {
          
          return formData.location !== '' && formData.streetNumber !== '';
        }
      case 2:
        return formData.title.length >= 3 && formData.description.length >= 10 && formData.category !== '';
      case 3:
        return formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      default:
        return false;
    }
  };

  return (
    <div className="container-fluid h-100 py-4">
      <form onSubmit={handleSubmit} role="form" aria-label="Obrazec za oddajo pobude">
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
              aria-label="Pojdi na prejšnji korak"
            >
              Prejšnji
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary ms-auto"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!isStepValid() || isSubmitting}
              aria-label="Pojdi na naslednji korak"
            >
              Naprej
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success ms-auto"
              disabled={!isStepValid() || isSubmitting}
              aria-describedby={isSubmitting ? "submitting-status" : undefined}
            >
              {isSubmitting ? 'Oddajanje...' : 'Oddaj pobudo'}
            </button>
          )}
        </div>
        
        {isSubmitting && (
          <div id="submitting-status" className="visually-hidden" aria-live="polite">
            Vaša pobuda se oddaja, prosimo počakajte...
          </div>
        )}
      </form>
    </div>
  );
};

export default InitiativeForm; 