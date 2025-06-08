import React, { useEffect, useState } from 'react';
import { getPobude, Pobuda } from '../services/api';
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
        setError(err instanceof Error ? err.message : 'Failed to fetch initiatives');
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
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">All Initiatives</h2>
      
      <div className="row g-4">
        {initiatives.map(initiative => (
          <div key={initiative.id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              {initiative.image_path && (
                <img 
                  src={`http://localhost:8000${initiative.image_path}`}
                  className="card-img-top"
                  alt={initiative.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{initiative.title}</h5>
                <p className="card-text text-muted mb-2">
                  <small>
                    <i className="bi bi-geo-alt"></i> {initiative.location}
                  </small>
                </p>
                <p className="card-text">
                  {initiative.description.length > 150 
                    ? `${initiative.description.substring(0, 150)}...` 
                    : initiative.description}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge bg-${initiative.status === 'v obravnavi' ? 'warning' : 'success'}`}>
                    {initiative.status}
                  </span>
                  <small className="text-muted">
                    {new Date(initiative.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {initiatives.length === 0 && (
        <div className="text-center py-5">
          <p className="mb-4">No initiatives found.</p>
          <Link to="/" className="btn btn-primary">
            Submit New Initiative
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllInitiativesPage;
