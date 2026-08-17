import { useState, useEffect, useRef } from 'react';
import { getMyRequests, deleteRequest } from '../services/requestService';
import './MesDemandesPage.css';

const STATUS_FILTERS = [
  { label: 'Toutes', value: 'all' },
  { label: 'Envoyées', value: 'Envoyée' },
  { label: 'En attente', value: 'En attente' },
  { label: 'Complétées', value: 'Complétée' },
];

function MesDemandesPage({ onNavigate, onLogout, onViewRequest, onEditRequest }) {
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

  const token = localStorage.getItem('lexy_token');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // === BLOCK: DELETED TOGGLE STATE — START === //
  const [showDeleted, setShowDeleted] = useState(false);
  // === BLOCK: DELETED TOGGLE STATE — END === //

  // === BLOCK: SORT STATE — START === //
  const [sortOrder, setSortOrder] = useState('newest');
  // === BLOCK: SORT STATE — END === //

  // === BLOCK: POPOVER STATE — START === //
  const [popoverRequestId, setPopoverRequestId] = useState(null);
  const popoverRef = useRef(null);
  // === BLOCK: POPOVER STATE — END === //

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getMyRequests(token);
        setRequests(data.requests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [token]);

  // === BLOCK: CLOSE POPOVER ON OUTSIDE CLICK — START === //
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverRequestId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // === BLOCK: CLOSE POPOVER ON OUTSIDE CLICK — END === //

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // === BLOCK: DELETE HANDLER — START === //
  async function handleDelete(requestId) {
    try {
      const result = await deleteRequest(requestId, token);
      setRequests((prev) =>
        prev.map((r) => (r.RequestId === requestId ? result.request : r))
      );
      setPopoverRequestId(null);
    } catch (err) {
      alert(err.message);
    }
  }
  // === BLOCK: DELETE HANDLER — END === //

 // === BLOCK: FILTER + SORT LOGIC — START === //
  const visibleRequests = requests
    .filter((r) => {
      const isDeleted = r.RequestStatuses?.StatusName === 'Supprimée';
      if (showDeleted) return isDeleted;
      if (isDeleted) return false;
      if (activeFilter === 'all') return true;
      return r.RequestStatuses?.StatusName === activeFilter;
    })
   .sort((a, b) => {
      if (sortOrder === 'alpha') {
        return a.Title.localeCompare(b.Title, 'fr');
      }
      // For deleted requests, sort by LastModifiedAt (when they were deleted)
      // For active requests, sort by CreatedAt
      const dateA = showDeleted
        ? new Date(a.LastModifiedAt || a.CreatedAt)
        : new Date(a.CreatedAt);
      const dateB = showDeleted
        ? new Date(b.LastModifiedAt || b.CreatedAt)
        : new Date(b.CreatedAt);

      if (sortOrder === 'newest') return dateB - dateA;
      if (sortOrder === 'oldest') return dateA - dateB;
      return 0;
    });
  // === BLOCK: FILTER + SORT LOGIC — END === //

  return (
    <div className="dashboard">

      <aside className="sidebar">
        <div className="sidebar-bg"></div>
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <div className="logo-mark">L</div>
            <div>
              <div className="logo-name">LexY</div>
              <div className="logo-tagline">EXECUTIVE SERVICE</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>Tableau de bord</a>
            <a href="#" className="nav-item active">Mes demandes</a>
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigate('livrables'); }}>Livrables</a>
          </nav>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="greeting">Mes demandes</h1>
            <p className="greeting-sub">Toutes vos demandes de service en un seul endroit.</p>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-avatar">{initial}</div>
              <span>{firstName}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>Se déconnecter</button>
          </div>
        </header>

        <main className="content">

          {/* === BLOCK: HEADING ROW + TOGGLE — START === */}
          <div className="requests-heading-row">
            <h2 className="requests-heading">
              {showDeleted ? 'Demandes supprimées' : 'Mes demandes'}
            </h2>
            <div className="heading-right">
              <select
                className="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="alpha">A → Z</option>
              </select>
              <button
                className="toggle-deleted-link"
                onClick={() => {
                  setShowDeleted((prev) => !prev);
                  setActiveFilter('all');
                }}
              >
                {showDeleted ? '← Voir les demandes actives' : 'Voir les demandes supprimées'}
              </button>
            </div>
          </div>
          {/* === BLOCK: HEADING ROW + TOGGLE — END === */}

          {/* === BLOCK: STATUS FILTER CHIPS — START === */}
          {!showDeleted && (
            <div className="filter-chips-row">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`filter-chip ${activeFilter === f.value ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {/* === BLOCK: STATUS FILTER CHIPS — END === */}

          {error && <div className="requests-error">{error}</div>}
          {loading && <p className="requests-empty">Chargement de vos demandes...</p>}

          {!loading && !error && visibleRequests.length === 0 && (
            <p className="requests-empty">Aucune demande pour ce filtre.</p>
          )}

          {/* === BLOCK: REQUESTS LIST — START === */}
          {!loading && !error && visibleRequests.length > 0 && (
            <div className="requests-list">
              {visibleRequests.map((request) => (
                <div
                  className="request-item"
                  key={request.RequestId}
                  onClick={() => onViewRequest(request.RequestId, false)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="request-item-main">
                    <div className="request-item-title-row">
                      <div className="request-item-title">{request.Title}</div>
                      <span className="request-item-status">
                        {request.RequestStatuses?.StatusName}
                      </span>
                    </div>
<div className="request-item-date">
                      Créée le {formatDate(request.CreatedAt)}
                      {request.LastModifiedAt && (
                        <span style={{ marginLeft: '12px', color: '#9CA3AF' }}>
                          · Modifiée le {formatDate(request.LastModifiedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                 {!showDeleted && (
                  <div className="request-item-actions">
                    <button
                      className="icon-btn"
                      onClick={(e) => { e.stopPropagation(); onEditRequest(request.RequestId); }}
                      title="Modifier"
                    >
                      ✏️
                    </button>

                    {/* === BLOCK: DELETE POPOVER — START === */}
                    <div className="popover-wrapper">
                      <button
                        className="icon-btn icon-btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopoverRequestId((prev) =>
                            prev === request.RequestId ? null : request.RequestId
                          );
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>

                      {popoverRequestId === request.RequestId && (
                        <div
                          className="delete-popover"
                          ref={popoverRef}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="popover-arrow" />
                          <p className="popover-message">Confirmer la suppression</p>
                          <div className="popover-actions">
                            <button
                              className="popover-cancel"
                              onClick={() => setPopoverRequestId(null)}
                            >
                              Annuler
                            </button>
                            <button
                              className="popover-confirm"
                              onClick={() => handleDelete(request.RequestId)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* === BLOCK: DELETE POPOVER — END === */}
                  </div>
                  )}

                </div>
              ))}
            </div>
          )}
          {/* === BLOCK: REQUESTS LIST — END === */}

        </main>
      </div>
    </div>
  );
}

export default MesDemandesPage;