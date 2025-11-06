import React, { useEffect, useState } from 'react';
import { getPobude, Pobuda, toAssetUrl } from '../services/api';
import { Link } from 'react-router-dom';

const AllInitiativesPage: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Pobuda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const data = await getPobude();
        setInitiatives(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Napaka pri pridobivanju pobud');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status" aria-label="Nalaganje pobud">
            <span className="visually-hidden">Nalaganje...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Vse pobude</h1>
      
      <div className="row g-4" role="list" aria-label="Seznam pobud">
        {initiatives.map(initiative => (
          <div key={initiative.id} className="col-md-6 col-lg-4" role="listitem">
            <article className="card h-100">
              {initiative.image_path && (
                <img 
                  src={toAssetUrl(initiative.image_path)}
                  className="card-img-top"
                  alt={`Slika za pobudo: ${initiative.title}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h2 className="card-title h5">{initiative.title}</h2>
                <p className="card-text text-muted mb-2">
                  <small>
                    <i className="bi bi-geo-alt" aria-hidden="true"></i> {initiative.location}
                  </small>
                </p>
                <p className="card-text">
                  {initiative.description.length > 150 
                    ? `${initiative.description.substring(0, 150)}...` 
                    : initiative.description}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span 
                    className={`badge bg-${initiative.status === 'v obravnavi' ? 'warning' : 'success'}`}
                    aria-label={`Status: ${initiative.status}`}
                  >
                    {initiative.status}
                  </span>
                  <small className="text-muted">
                    {new Date(initiative.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      {initiatives.length === 0 && (
        <div className="text-center py-5">
          <p className="mb-4">Ni najdenih pobud.</p>
          <Link to="/" className="btn btn-primary">
            Oddaj novo pobudo
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllInitiativesPage;
