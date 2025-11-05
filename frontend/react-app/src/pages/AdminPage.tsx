import { useState, useEffect, useRef, useCallback } from 'react';
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

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminPage = () => {
  const [pobude, setPobude] = useState<Pobuda[]>([]);
  const [filteredPobude, setFilteredPobude] = useState<Pobuda[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedPobuda, setSelectedPobuda] = useState<Pobuda | null>(null);
  const [response, setResponse] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'v obravnavi' | 'odgovorjeno'>('v obravnavi');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [autoFillFetches, setAutoFillFetches] = useState<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [importanceMap, setImportanceMap] = useState<{ [id: number]: number }>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchNextPage(true);
  }, [pageSize]);

  useEffect(() => {
    filterPobude();
  }, [pobude, statusFilter, categoryFilter, importanceMap, sortOrder]);

  
  useEffect(() => {
    setAutoFillFetches(0);
  }, [searchTerm, statusFilter, categoryFilter]);

  
  useEffect(() => {
    setOffset(0);
    setPobude([]);
    setHasMore(true);
    setNoResults(false);
    setAutoFillFetches(0);
    fetchNextPage(true);
  }, [categoryFilter]);

  
  useEffect(() => {
    setOffset(0);
    setPobude([]);
    setHasMore(true);
    setNoResults(false);
    setAutoFillFetches(0);
    fetchNextPage(true);
  }, [statusFilter]);

  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        setIsSearching(true);
      }
      
      fetchNextPage(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedPobuda) {
        setSelectedPobuda(null);
        setResponse('');
      }
    };

    if (selectedPobuda) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPobuda]);

  

  const fetchNextPage = useCallback(async (reset: boolean = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (reset || offset === 0) {
        setIsInitialLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      
      if (statusFilter === 'v obravnavi') {
        const [pobudeData, statsData] = await Promise.all([
          getPobude({ 
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: 'v obravnavi',
            search: searchTerm.trim() !== '' ? searchTerm.trim() : undefined
            
          }),
          fetch(`${API_BASE_URL}/admin/statistics`).then(res => res.json())
        ]);
        setPobude(pobudeData);
        setOffset(pobudeData.length);
        setStatistics(statsData);
        setHasMore(false); 
      } else {
        
        const nextOffset = reset ? 0 : offset;
        const [pobudeData, statsData] = await Promise.all([
          getPobude({ 
            limit: pageSize, 
            offset: nextOffset, 
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchTerm.trim() !== '' ? searchTerm.trim() : undefined
          }),
          fetch(`${API_BASE_URL}/admin/statistics`).then(res => res.json())
        ]);
        if (reset) {
          setPobude(pobudeData);
          setOffset(pobudeData.length);
        } else {
          setPobude(prev => [...prev, ...pobudeData]);
          setOffset(prev => prev + pobudeData.length);
        }
        setStatistics(statsData);
        setHasMore(pobudeData.length === pageSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri pridobivanju podatkov');
    } finally {
      setIsInitialLoading(false);
      setIsFetchingMore(false);
      setIsSearching(false);
      isFetchingRef.current = false;
    }
  }, [offset, pageSize, categoryFilter, statusFilter, searchTerm]);

  const filterPobude = () => {
    let filtered = [...pobude];

    
    

    
    if (Object.keys(importanceMap).length > 0) {
      filtered.sort((a, b) => {
        const aImportance = importanceMap[a.id] || 0;
        const bImportance = importanceMap[b.id] || 0;
        
        if (sortOrder === 'desc') {
          return bImportance - aImportance;
        } else {
          return aImportance - bImportance;
        }
      });
    }

    setFilteredPobude(filtered);
    setNoResults(filtered.length === 0);
  };

  
  useEffect(() => {
    const el = sentinelRef.current;
    const rootEl = listContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      const isScrollable = !!rootEl && (rootEl.scrollHeight - rootEl.clientHeight > 20);
      if (!isScrollable && hasMore && !isInitialLoading && !isFetchingMore && !noResults) {
        if (autoFillFetches < 2) {
          setAutoFillFetches(prev => prev + 1);
          fetchNextPage();
        }
        return;
      }
      if (first.isIntersecting && hasMore && !isInitialLoading && !isFetchingMore && !noResults && isScrollable) {
        fetchNextPage();
      }
    }, { root: rootEl ?? null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasMore, isInitialLoading, isFetchingMore, noResults, autoFillFetches]);

  const handleRespond = async (pobudaId: number) => {
    try {
      const responseData = await fetch(`${API_BASE_URL}/pobude/${pobudaId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (!responseData.ok) {
        throw new Error('Napaka pri oddaji odgovora');
      }

      
      await fetchNextPage(true);
      setSelectedPobuda(null);
      setResponse('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri oddaji odgovora');
    }
  };

  const handleAiSort = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai-prioritize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pobude)
      });
      
      if (!res.ok) {
        throw new Error('Napaka pri AI analizi pobud');
      }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        
        const newMap: { [id: number]: number } = {};
        data.forEach((p: any) => {
          newMap[p.id] = p.nujnost;
        });
        setImportanceMap(newMap);
      }
    } catch (err) {
      console.error('AI prioritization error:', err);
      alert('Napaka pri AI analizi pobud');
    }
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistika pobud (zadnjih 30 dni)',
      },
    },
  };

  const chartData = statistics ? {
    labels: statistics.daily_stats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Nove pobude',
        data: statistics.daily_stats.map(stat => stat.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Odgovori',
        data: statistics.response_stats.map(stat => stat.count),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  } : null;

  if (isInitialLoading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Nalaganje...</span>
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
      <h2 className="mb-4">Administratorska nadzorna plošča</h2>
      
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Skupaj pobud</h5>
              <p className="card-text display-4">{statistics?.total_pobude}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">V obravnavi</h5>
              <p className="card-text display-4">{statistics?.pending_pobude}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Odgovorjeno</h5>
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

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="search-pobude" className="form-label">Išči po naslovu:</label>
            <div className="input-group">
              <input
                type="text"
                id="search-pobude"
                className="form-control"
                placeholder="Išči po naslovu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                <span className="input-group-text">
                  <div className="spinner-border spinner-border-sm" role="status" aria-label="Iskanje...">
                    <span className="visually-hidden">Iskanje...</span>
                  </div>
                </span>
              )}
            </div>
          </div>
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <label htmlFor="status-filter" className="form-label">Filtriraj po statusu:</label>
              <select
                id="status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'v obravnavi' | 'odgovorjeno')}
              >
                <option value="all">Vse pobude</option>
                <option value="v obravnavi">Neodgovorjene</option>
                <option value="odgovorjeno">Odgovorjene</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="category-filter" className="form-label">Filtriraj po kategoriji:</label>
              <select
                id="category-filter"
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Vse kategorije</option>
                <option value="Ceste">Ceste</option>
                <option value="Drevesa, rastje in zelene površine">Drevesa, rastje in zelene površine</option>
                <option value="Parki in zelenice">Parki in zelenice</option>
                <option value="Javni red in mir">Javni red in mir</option>
                <option value="Delo Mestnega redarstva">Delo Mestnega redarstva</option>
                <option value="Vzdrževanje cest">Vzdrževanje cest</option>
                <option value="Kolesarske poti">Kolesarske poti</option>
                <option value="LPP">LPP</option>
                <option value="Pešpoti in pločniki">Pešpoti in pločniki</option>
                <option value="Razno">Razno</option>
                <option value="Umiritev prometa in varnost">Umiritev prometa in varnost</option>
                <option value="Vodovod">Vodovod</option>
                <option value="Kultura">Kultura</option>
                <option value="Delo inšpekcij">Delo inšpekcij</option>
                <option value="Avtobusna postajališča">Avtobusna postajališča</option>
                <option value="Oglaševanje ">Oglaševanje </option>
                <option value="Športne površine">Športne površine</option>
                <option value="Mirujoči promet">Mirujoči promet</option>
                <option value="Socialno varstvo in zdravje">Socialno varstvo in zdravje</option>
                <option value="Informatika">Informatika</option>
                <option value="other">Drugo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pobude List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Seznam pobud</h5>
          <div className="table-responsive" ref={listContainerRef} style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Naslov</th>
                  <th>Lokacija</th>
                  <th>Status</th>
                  <th>Ustvarjeno</th>
                  {Object.keys(importanceMap).length > 0 && <th>Pomembnost</th>}
                  <th>Dejanja</th>
                </tr>
              </thead>
              <tbody>
                {filteredPobude.map((pobuda) => (
                  <tr key={pobuda.id}>
                    <td>{pobuda.title}</td>
                    <td>{pobuda.location}</td>
                    <td>
                      <span className={`badge bg-${pobuda.status === 'v obravnavi' ? 'warning' : 'success'}`}>
                        {pobuda.status}
                      </span>
                    </td>
                    <td>{new Date(pobuda.created_at).toLocaleDateString()}</td>
                    {Object.keys(importanceMap).length > 0 && (
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {/* Importance circle with improved color contrast */}
                        {(() => {
                          const value = importanceMap[pobuda.id] ?? '?';
                          let bgColor = '#0056b3'; 
                          let textColor = '#ffffff'; 
                          let ariaLabel = `Importance score: ${value} out of 100`;
                          
                          if (typeof value === 'number') {
                            if (value < 50) {
                              bgColor = '#b02a37'; 
                              ariaLabel = `Low importance score: ${value} out of 100`;
                            } else if (value > 80) {
                              bgColor = '#198754'; 
                              ariaLabel = `High importance score: ${value} out of 100`;
                            } else {
                              ariaLabel = `Medium importance score: ${value} out of 100`;
                            }
                          }
                          
                          return (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: bgColor,
                                color: textColor,
                                fontWeight: 'bold',
                                fontSize: 18,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                border: '2px solid #fff',
                              }}
                              title="Nujnost pobude (AI)"
                              aria-label={ariaLabel}
                              role="img"
                            >
                              {value}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td>
                      {pobuda.status === 'v obravnavi' ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedPobuda(pobuda)}
                        >
                          Odgovori
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelectedPobuda(pobuda)}
                        >
                          Ogled odgovora
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <div ref={sentinelRef} />
              </tbody>
            </table>
          </div>
          {isFetchingMore && (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm" role="status" aria-label="Nalaganje dodatnih">
                <span className="visually-hidden">Nalaganje...</span>
              </div>
            </div>
          )}
          {noResults && (
            <div className="text-center text-muted mt-2"><small>Ni najdenih pobud za izbrane filtre.</small></div>
          )}
          {!hasMore && !noResults && !searchTerm.trim() && (
            <div className="text-center text-muted mt-2"><small>Ni več rezultatov.</small></div>
          )}
        </div>
      </div>

      {/* Add this button above the list/table of initiatives */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-info" onClick={handleAiSort}>
          AI razvrsti po prioriteti
        </button>
        {Object.keys(importanceMap).length > 0 && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleSortToggle}
          >
            {sortOrder === 'desc' ? '↓ Padajoče' : '↑ Naraščajoče'}
          </button>
        )}
      </div>

      {/* Response Modal */}
      {selectedPobuda && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedPobuda.status === 'v obravnavi' ? 'Odgovori na pobudo' : 'Ogled odgovora'}
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
                    <label htmlFor="response" className="form-label">Odgovor:</label>
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
                    <strong>Odgovor:</strong>
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
                  Zapri
                </button>
                {selectedPobuda.status === 'v obravnavi' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleRespond(selectedPobuda.id)}
                    disabled={!response.trim()}
                  >
                    Oddaj odgovor
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
