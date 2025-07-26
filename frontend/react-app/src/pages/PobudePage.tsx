import { useState, useEffect } from 'react';
import { getPobude, Pobuda } from '../services/api';
import MapView from '../components/MapView';

const PobudePage = () => {
    const [pobude, setPobude] = useState<Pobuda[]>([]);
    const [filteredPobude, setFilteredPobude] = useState<Pobuda[]>([]);
    const [selectedPobuda, setSelectedPobuda] = useState<Pobuda | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        fetchPobude();
    }, []);

    useEffect(() => {
        filterAndSortPobude();
    }, [pobude, searchTerm, statusFilter, sortOrder]);

    const fetchPobude = async () => {
        try {
            setIsLoading(true);
            const data = await getPobude();
            setPobude(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch pobude');
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortPobude = () => {
        let filtered = [...pobude];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(pobuda =>
                pobuda.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(pobuda => pobuda.status === statusFilter);
        }

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredPobude(filtered);
    };

    const handlePobudaSelect = (pobuda: Pobuda) => {
        setSelectedPobuda(pobuda);
        setFocusLocation([pobuda.latitude, pobuda.longitude]);
    };

    if (isLoading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status" aria-label="Loading pobude">
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

    return (
        <div className="container-fluid d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
            <div className="row flex-grow-1 min-h-0" style={{ minHeight: 0 }}>
                {/* Map Section - Left side */}
                <div className="col-lg-8 p-0 d-flex flex-grow-1" style={{ minHeight: '84vh' }}>
                    <MapView isSelectionMode={false} focusLocation={focusLocation} />
                </div>
                
                {/* List Section - Right side */}
                <div className="col-lg-4 py-3">
                    <h1 className="mb-4">Vse pobude</h1>
                    
                    {/* Search and Filters */}
                    <div className="mb-4">
                        <div className="input-group mb-3">
                            <label htmlFor="search-pobude" className="visually-hidden">Search pobude by title</label>
                            <input
                                type="text"
                                id="search-pobude"
                                className="form-control"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search pobude by title"
                            />
                        </div>
                        <div className="row g-2">
                            <div className="col">
                                <label htmlFor="status-filter" className="visually-hidden">Filter by status</label>
                                <select
                                    id="status-filter"
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    aria-label="Filter pobude by status"
                                >
                                    <option value="all">All Pobude</option>
                                    <option value="v obravnavi">Unanswered</option>
                                    <option value="odgovorjeno">Answered</option>
                                </select>
                            </div>
                            <div className="col">
                                <label htmlFor="sort-order" className="visually-hidden">Sort by date</label>
                                <select
                                    id="sort-order"
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                    aria-label="Sort pobude by date"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="list-group" role="list" aria-label="List of pobude">
                        {filteredPobude.map((pobuda) => (
                            <div
                                key={pobuda.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handlePobudaSelect(pobuda)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handlePobudaSelect(pobuda);
                                    }
                                }}
                                tabIndex={0}
                                role="listitem"
                                aria-label={`View details for ${pobuda.title}`}
                            >
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div>
                                        <h2 className="mb-1 h6">{pobuda.title}</h2>
                                        <small className="text-muted">{pobuda.location}</small>
                                    </div>
                                    <div className="text-end">
                                        <span 
                                            className={`badge bg-${pobuda.status === 'v obravnavi' ? 'warning' : 'success'} mb-2`}
                                            aria-label={`Status: ${pobuda.status}`}
                                        >
                                            {pobuda.status}
                                        </span>
                                        <br />
                                        <small className="text-muted">
                                            {new Date(pobuda.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pobuda Details Modal */}
            {selectedPobuda && (
                <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 id="modal-title" className="modal-title h5">{selectedPobuda.title}</h2>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setSelectedPobuda(null);
                                        setFocusLocation(null);
                                    }}
                                    aria-label="Close modal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <h3 className="h6">Location</h3>
                                    <p className="text-muted">{selectedPobuda.location}</p>
                                </div>
                                <div className="mb-3">
                                    <h3 className="h6">Description</h3>
                                    <p>{selectedPobuda.description}</p>
                                </div>
                                {selectedPobuda.image_path && (
                                    <div className="mb-3">
                                        <h3 className="h6">Image</h3>
                                        <img
                                            src={selectedPobuda.image_path}
                                            alt={`Image for ${selectedPobuda.title}`}
                                            className="img-fluid rounded"
                                        />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <h3 className="h6">Status</h3>
                                    <span 
                                        className={`badge bg-${selectedPobuda.status === 'v obravnavi' ? 'warning' : 'success'}`}
                                        aria-label={`Status: ${selectedPobuda.status}`}
                                    >
                                        {selectedPobuda.status}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    <h3 className="h6">Response</h3>
                                    {selectedPobuda.response ? (
                                        <div className="alert alert-info">
                                            <p className="mb-0">{selectedPobuda.response}</p>
                                            {selectedPobuda.responded_at && (
                                                <small className="text-muted">
                                                    Responded on: {new Date(selectedPobuda.responded_at).toLocaleDateString()}
                                                </small>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <p className="mb-0">No response yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSelectedPobuda(null);
                                        setFocusLocation(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PobudePage; 