import React, { useState, useEffect } from 'react';
import { getPobude, Pobuda } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Statistics {
  total_pobude: number;
  pending_pobude: number;
  responded_pobude: number;
  daily_stats: Array<{ date: string; count: number }>;
  response_stats: Array<{ date: string; count: number }>;
}

const AdminPage = () => {
  const [pobude, setPobude] = useState<Pobuda[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedPobuda, setSelectedPobuda] = useState<Pobuda | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pobudeData, statsData] = await Promise.all([
        getPobude(),
        fetch('http://localhost:8000/api/admin/statistics').then(res => res.json())
      ]);
      setPobude(pobudeData);
      setStatistics(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (pobudaId: number) => {
    try {
      const responseData = await fetch(`http://localhost:8000/api/pobude/${pobudaId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (!responseData.ok) {
        throw new Error('Failed to submit response');
      }

      // Refresh data after successful response
      await fetchData();
      setSelectedPobuda(null);
      setResponse('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Pobude Statistics (Last 30 Days)',
      },
    },
  };

  const chartData = statistics ? {
    labels: statistics.daily_stats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: 'New Pobude',
        data: statistics.daily_stats.map(stat => stat.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Responses',
        data: statistics.response_stats.map(stat => stat.count),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  } : null;

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Pobude</h5>
              <p className="card-text display-4">{statistics?.total_pobude}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text display-4">{statistics?.pending_pobude}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Responded</h5>
              <p className="card-text display-4">{statistics?.responded_pobude}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card mb-4">
        <div className="card-body">
          {chartData && <Line options={chartOptions} data={chartData} />}
        </div>
      </div>

      {/* Pobude List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Pobude List</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pobude.map((pobuda) => (
                  <tr key={pobuda.id}>
                    <td>{pobuda.title}</td>
                    <td>{pobuda.location}</td>
                    <td>
                      <span className={`badge bg-${pobuda.status === 'v obravnavi' ? 'warning' : 'success'}`}>
                        {pobuda.status}
                      </span>
                    </td>
                    <td>{new Date(pobuda.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedPobuda(pobuda)}
                      >
                        {pobuda.status === 'v obravnavi' ? 'Respond' : 'View Response'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {selectedPobuda && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedPobuda.status === 'v obravnavi' ? 'Respond to Pobuda' : 'View Response'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedPobuda(null);
                    setResponse('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <h6>{selectedPobuda.title}</h6>
                <p className="text-muted">{selectedPobuda.location}</p>
                <p>{selectedPobuda.description}</p>
                
                {selectedPobuda.status === 'v obravnavi' ? (
                  <div className="mb-3">
                    <label htmlFor="response" className="form-label">Response:</label>
                    <textarea
                      id="response"
                      className="form-control"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <strong>Response:</strong>
                    <p className="mb-0">{selectedPobuda.response}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedPobuda(null);
                    setResponse('');
                  }}
                >
                  Close
                </button>
                {selectedPobuda.status === 'v obravnavi' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleRespond(selectedPobuda.id)}
                    disabled={!response.trim()}
                  >
                    Submit Response
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
