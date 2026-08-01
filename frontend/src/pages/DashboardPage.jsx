import { useState, useEffect, useRef } from 'react';
import { getMyRequests, deleteRequest } from '../services/requestService';
import './DashboardPage.css';

function DashboardPage({ onLogout, onNewRequest, onViewRequest, onEditRequest, initialShowDeleted }) {
const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

  const token = localStorage.getItem('lexy_token');
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');

  // === BLOCK: DELETED-VIEW TOGGLE STATE — START === //
  const [showDeleted, setShowDeleted] = useState(initialShowDeleted || false);
  // === BLOCK: DELETED-VIEW TOGGLE STATE — END === //

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
        setRequestsError(err.message);
      } finally {
        setLoadingRequests(false);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // === BLOCK: FILTER ACTIVE VS DELETED REQUESTS — START === //
  const visibleRequests = requests.filter((r) => {
    const isDeleted = r.RequestStatuses?.StatusName === 'Supprimée';
    return showDeleted ? isDeleted : !isDeleted;
  });
  // === BLOCK: FILTER ACTIVE VS DELETED REQUESTS — END === //

  return (
    <div className="dashboard">

      {/* ═════════ SIDEBAR ═════════ */}
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
            <a href="#" className="nav-item active">Tableau de bord</a>
            <a href="#" className="nav-item">Mes demandes</a>
            <a href="#" className="nav-item">Livrables</a>
            <a href="#" className="nav-item">Messages</a>
            <a href="#" className="nav-item">Contrats et paiements</a>
            <a href="#" className="nav-item">Informations utiles</a>
          </nav>
        </div>
      </aside>

      {/* ═════════ MAIN AREA ═════════ */}
      <div className="main">

        <header className="topbar">
          <div>
            <h1 className="greeting">Bonjour, {firstName}</h1>
            <p className="greeting-sub">Voici un aperçu de vos services aujourd'hui.</p>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-avatar">{initial}</div>
              <span>{firstName}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </header>

        <main className="content">

          <section className="hero-banner">
            <div className="hero-bg"></div>
            <div className="hero-content">
              <h2>Besoin d'un service ?</h2>
              <p>
                Soumettez une demande et votre agent dédié s'en occupe — voyage,
                réservation, recherche, et plus.
              </p>
              <button className="hero-btn" onClick={onNewRequest}>+ Nouvelle demande</button>
            </div>
          </section>

          <section className="stats">
            <div className="stat-card" style={{ borderTopColor: '#2E75B6' }}>
              <div className="stat-label">DEMANDES ACTIVES</div>
              <div className="stat-value">0</div>
              <div className="stat-sub">en cours de traitement</div>
            </div>
            <div className="stat-card" style={{ borderTopColor: '#10B981' }}>
              <div className="stat-label">DEMANDES COMPLÉTÉES</div>
              <div className="stat-value">0</div>
              <div className="stat-sub">depuis votre inscription</div>
            </div>
            <div className="stat-card" style={{ borderTopColor: '#A8842F' }}>
              <div className="stat-label">TEMPS ÉCONOMISÉ</div>
              <div className="stat-value">0 h</div>
              <div className="stat-sub">ce trimestre</div>
            </div>
            <div className="stat-card" style={{ borderTopColor: '#F59E0B' }}>
              <div className="stat-label">ARGENT ÉCONOMISÉ</div>
              <div className="stat-value">0 $</div>
              <div className="stat-sub">grâce à nos négociations</div>
            </div>
          </section>

          <section className="requests-section">

            {/* === BLOCK: SECTION HEADING + TOGGLE LINK — START === */}
            <div className="requests-heading-row">
              <h2 className="requests-heading">
                {showDeleted ? 'Demandes supprimées' : 'Mes demandes récentes'}
              </h2>
              <button
                className="toggle-deleted-link"
                onClick={() => setShowDeleted((prev) => !prev)}
              >
                {showDeleted ? '← Voir les demandes actives' : 'Voir les demandes supprimées'}
              </button>
            </div>
            {/* === BLOCK: SECTION HEADING + TOGGLE LINK — END === */}

            {requestsError && <div className="requests-error">{requestsError}</div>}

            {!requestsError && loadingRequests && (
              <p className="requests-empty">Chargement de vos demandes...</p>
            )}

            {!requestsError && !loadingRequests && visibleRequests.length === 0 && (
              <p className="requests-empty">
                {showDeleted
                  ? 'Aucune demande supprimée.'
                  : "Vous n'avez aucune demande pour le moment."}
              </p>
            )}

            {!requestsError && !loadingRequests && visibleRequests.length > 0 && (
              <div className="requests-list">
                {visibleRequests.map((request) => (
                  <div
                    className="request-item"
                    key={request.RequestId}
                    onClick={() => onViewRequest(request.RequestId, showDeleted)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="request-item-main">
                      <div className="request-item-title-row">
                        <div className="request-item-title">{request.Title}</div>
                        <span className="request-item-status">
                          {request.RequestStatuses?.StatusName}
                        </span>
                      </div>
                      <div className="request-item-date">{formatDate(request.CreatedAt)}</div>
                    </div>

                    {/* === BLOCK: ROW ACTIONS (edit + delete, hidden for deleted items) — START === */}
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
                    {/* === BLOCK: ROW ACTIONS — END === */}

                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>

    </div>
  );
}

export default DashboardPage;