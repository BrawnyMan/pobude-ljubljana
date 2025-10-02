import { useState, useEffect, useRef, useCallback } from 'react';
import { getPobude, Pobuda } from '../services/api';
import MapView from '../components/MapView';

const PobudePage = () => {
    const [pobude, setPobude] = useState<Pobuda[]>([]);
    const [filteredPobude, setFilteredPobude] = useState<Pobuda[]>([]);
    const [selectedPobuda, setSelectedPobuda] = useState<Pobuda | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
    const [pageSize, setPageSize] = useState<number>(20);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const isFetchingRef = useRef<boolean>(false);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        // initial fetch
        fetchNextPage(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    useEffect(() => {
        filterAndSortPobude();
    }, [pobude, searchTerm, statusFilter, sortOrder]);

    const fetchNextPage = useCallback(async (reset: boolean = false) => {
        if (isFetchingRef.current) return;
        try {
            isFetchingRef.current = true;
            if (reset || offset === 0) {
                setIsInitialLoading(true);
            } else {
                setIsFetchingMore(true);
            }
            const nextOffset = reset ? 0 : offset;
            const data = await getPobude({ limit: pageSize, offset: nextOffset });
            if (reset) {
                setPobude(data);
                setOffset(data.length);
            } else {
                setPobude(prev => [...prev, ...data]);
                setOffset(prev => prev + data.length);
            }
            setHasMore(data.length === pageSize);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch pobude');
        } finally {
            setIsInitialLoading(false);
            setIsFetchingMore(false);
            isFetchingRef.current = false;
        }
    }, [offset, pageSize]);

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

    // Infinite scroll handler
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const listContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        const rootEl = listContainerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasMore && !isInitialLoading && !isFetchingMore) {
                fetchNextPage();
            }
        }, { root: rootEl ?? null, rootMargin: '200px', threshold: 0 });
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, hasMore, isInitialLoading, isFetchingMore]);

    const handlePobudaSelect = (pobuda: Pobuda) => {
        setSelectedPobuda(pobuda);
        setFocusLocation([pobuda.latitude, pobuda.longitude]);
    };

    if (isInitialLoading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status" aria-label="Nalaganje pobud">
                        <span className="visually-hidden">Nalaganje...</span>
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
                <div className="col-lg-8 p-0" style={{ height: '84vh' }}>
                    <MapView isSelectionMode={false} focusLocation={focusLocation} />
                </div>
                
                {/* List Section - Right side */}
                <div className="col-lg-4 py-3" style={{ height: '84vh', display: 'flex', flexDirection: 'column' }}>
                    <h1 className="mb-4">Vse pobude</h1>
                    
                    {/* Iskanje, filtri in velikost strani */}
                    <div className="mb-4">
                        <div className="input-group mb-3">
                            <label htmlFor="search-pobude" className="visually-hidden">Iskanje pobud po naslovu</label>
                            <input
                                type="text"
                                id="search-pobude"
                                className="form-control"
                                placeholder="Išči po naslovu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Iskanje pobud po naslovu"
                            />
                        </div>
                        <div className="row g-2">
                            <div className="col">
                                <label htmlFor="status-filter" className="visually-hidden">Filtriraj po statusu</label>
                                <select
                                    id="status-filter"
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    aria-label="Filtriranje pobud po statusu"
                                >
                                    <option value="all">Vse pobude</option>
                                    <option value="v obravnavi">Neodgovorjene</option>
                                    <option value="odgovorjeno">Odgovorjene</option>
                                </select>
                            </div>
                            <div className="col">
                                <label htmlFor="sort-order" className="visually-hidden">Razvrsti po datumu</label>
                                <select
                                    id="sort-order"
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                    aria-label="Razvrščanje pobud po datumu"
                                >
                                    <option value="newest">Najnovejše najprej</option>
                                    <option value="oldest">Najstarejše najprej</option>
                                </select>
                            </div>
                            <div className="col">
                                <label htmlFor="page-size" className="visually-hidden">Število na stran</label>
                                <select
                                    id="page-size"
                                    className="form-select"
                                    value={pageSize}
                                    onChange={(e) => {
                                        const newSize = Number(e.target.value);
                                        setPageSize(newSize);
                                        setOffset(0);
                                        setHasMore(true);
                                    }}
                                    aria-label="Število elementov na stran"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div ref={listContainerRef} className="list-group" role="list" aria-label="Seznam pobud" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
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
                                aria-label={`Ogled podrobnosti za ${pobuda.title}`}
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
                        <div ref={sentinelRef} />
                    </div>
                    {isFetchingMore && (
                        <div className="text-center py-2">
                            <div className="spinner-border spinner-border-sm" role="status" aria-label="Nalaganje dodatnih">
                                <span className="visually-hidden">Nalaganje...</span>
                            </div>
                        </div>
                    )}
                    {!hasMore && (
                        <div className="text-center text-muted mt-2"><small>Ni več rezultatov.</small></div>
                    )}
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
                                    aria-label="Zapri okno"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <h3 className="h6">Lokacija</h3>
                                    <p className="text-muted">{selectedPobuda.location}</p>
                                </div>
                                <div className="mb-3">
                                    <h3 className="h6">Opis</h3>
                                    <p>{selectedPobuda.description}</p>
                                </div>
                                {selectedPobuda.image_path && (
                                    <div className="mb-3">
                                        <h3 className="h6">Slika</h3>
                                        <img
                                            src={selectedPobuda.image_path}
                                            alt={`Slika za ${selectedPobuda.title}`}
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
                                    <h3 className="h6">Odgovor</h3>
                                    {selectedPobuda.response ? (
                                        <div className="alert alert-info">
                                            <p className="mb-0">{selectedPobuda.response}</p>
                                            {selectedPobuda.responded_at && (
                                                <small className="text-muted">
                                                    Odgovor dne: {new Date(selectedPobuda.responded_at).toLocaleDateString()}
                                                </small>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <p className="mb-0">Brez odgovora.</p>
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
                                    Zapri
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