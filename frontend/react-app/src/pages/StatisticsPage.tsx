import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CategoryStatistics {
  category: string;
  total: number;
  pending: number;
  responded: number;
  response_rate: number;
}

interface MonthlyStatistics {
  month: string;
  total: number;
  responded: number;
}

interface LocationStatistics {
  location: string;
  total: number;
  responded: number;
  pending: number;
}

interface SummaryStatistics {
  total_pobude: number;
  pending_pobude: number;
  responded_pobude: number;
  response_rate: number;
  average_response_time: number | null;
}

interface StatisticsData {
  summary: SummaryStatistics;
  category_stats: CategoryStatistics[];
  monthly_stats: MonthlyStatistics[];
  location_stats: LocationStatistics[];
  most_problematic_category: CategoryStatistics | null;
  least_problematic_category: CategoryStatistics | null;
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/statistics/public');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
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
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          No statistics available.
        </div>
      </div>
    );
  }

  // Chart data preparation
  const categoryChartData = {
    labels: statistics.category_stats.map(stat => stat.category),
    datasets: [
      {
        label: 'Responded',
        data: statistics.category_stats.map(stat => stat.responded),
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: statistics.category_stats.map(stat => stat.pending),
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: statistics.monthly_stats.map(stat => stat.month),
    datasets: [
      {
        label: 'Total Pobude',
        data: statistics.monthly_stats.map(stat => stat.total),
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Responded',
        data: statistics.monthly_stats.map(stat => stat.responded),
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const responseRateChartData = {
    labels: statistics.category_stats.map(stat => stat.category),
    datasets: [
      {
        label: 'Response Rate (%)',
        data: statistics.category_stats.map(stat => stat.response_rate),
        backgroundColor: statistics.category_stats.map(stat => 
          stat.response_rate > 80 ? 'rgba(40, 167, 69, 0.8)' :
          stat.response_rate > 50 ? 'rgba(255, 193, 7, 0.8)' :
          'rgba(220, 53, 69, 0.8)'
        ),
        borderColor: statistics.category_stats.map(stat => 
          stat.response_rate > 80 ? 'rgba(40, 167, 69, 1)' :
          stat.response_rate > 50 ? 'rgba(255, 193, 7, 1)' :
          'rgba(220, 53, 69, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const locationChartData = {
    labels: statistics.location_stats.map(stat => stat.location),
    datasets: [
      {
        label: 'Total',
        data: statistics.location_stats.map(stat => stat.total),
        backgroundColor: 'rgba(13, 110, 253, 0.8)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistics Overview',
      },
    },
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Pobude Statistics</h1>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Pobude</h5>
              <h2 className="text-primary">{statistics.summary.total_pobude}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Responded</h5>
              <h2 className="text-success">{statistics.summary.responded_pobude}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h2 className="text-warning">{statistics.summary.pending_pobude}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Response Rate</h5>
              <h2 className="text-info">{statistics.summary.response_rate}%</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Problematic Categories Analysis */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Most Problematic Category</h5>
            </div>
            <div className="card-body">
              {statistics.most_problematic_category ? (
                <div>
                  <h6 className="text-danger">{statistics.most_problematic_category.category}</h6>
                  <p>Response Rate: {statistics.most_problematic_category.response_rate}%</p>
                  <p>Total: {statistics.most_problematic_category.total}</p>
                  <p>Responded: {statistics.most_problematic_category.responded}</p>
                  <p>Pending: {statistics.most_problematic_category.pending}</p>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Least Problematic Category</h5>
            </div>
            <div className="card-body">
              {statistics.least_problematic_category ? (
                <div>
                  <h6 className="text-success">{statistics.least_problematic_category.category}</h6>
                  <p>Response Rate: {statistics.least_problematic_category.response_rate}%</p>
                  <p>Total: {statistics.least_problematic_category.total}</p>
                  <p>Responded: {statistics.least_problematic_category.responded}</p>
                  <p>Pending: {statistics.least_problematic_category.pending}</p>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Category Distribution</h5>
            </div>
            <div className="card-body">
              <Bar data={categoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Trends</h5>
            </div>
            <div className="card-body">
              <Line data={monthlyChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Response Rate by Category</h5>
            </div>
            <div className="card-body">
              <Bar data={responseRateChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Location Distribution</h5>
            </div>
            <div className="card-body">
              <Bar data={locationChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Category Breakdown</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total</th>
                      <th>Responded</th>
                      <th>Pending</th>
                      <th>Rate %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.category_stats.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.category}</td>
                        <td>{stat.total}</td>
                        <td className="text-success">{stat.responded}</td>
                        <td className="text-warning">{stat.pending}</td>
                        <td>{stat.response_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Location Breakdown</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Total</th>
                      <th>Responded</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.location_stats.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.location}</td>
                        <td>{stat.total}</td>
                        <td className="text-success">{stat.responded}</td>
                        <td className="text-warning">{stat.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {statistics.summary.average_response_time && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Additional Information</h5>
              </div>
              <div className="card-body">
                <p><strong>Average Response Time:</strong> {statistics.summary.average_response_time} days</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage; 