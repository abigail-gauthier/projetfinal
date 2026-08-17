import { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus } from '../services/requestService';
import './AdminDashboardPage.css';

const ALL_STATUSES = [
  { StatusId: 2, StatusName: 'Envoyée' },
  { StatusId: 3, StatusName: 'En attente de révision' },
  { StatusId: 6, StatusName: 'Question posée' },
  { StatusId: 9, StatusName: 'Complétée' },
  { StatusId: 10, StatusName: 'Supprimée' },
];

const STATUS_COLORS = {
  'Envoyée':                   { bg: '#FEF3C7', color: '#92400E' },
  'En attente de révision':    { bg: '#FFEDD5', color: '#9A3412' },
  "En attente d'approbation":  { bg: '#F3E8FF', color: '#6B21A8' },
  'En cours':                  { bg: '#DBEAFE', color: '#1E40AF' },
  'Question posée':            { bg: '#FCE7F3', color: '#9D174D' },
  'Complétée':                 { bg: '#DCFCE7', color: '#166534' },
  'Annulée':                   { bg: '#FEE2E2', color: '#991B1B' },
  'Supprimée':                 { bg: '#F3F4F6', color: '#6B7280' },
  'En attente':                { bg: '#EDE9FE', color: '#5B21B6' },
  'Brouillon':                 { bg: '#F3F4F6', color: '#6B7280' },
};

const SERVICE_ICONS = {
  'Voyage': '✈️',
  'Réservation': '🍽️',
  'Recherche': '🔍',
  'Tâche admin.': '✏️',
  'Tâche administrative': '✏️',
  'Autre': '✨',
};

const FILTER_OPTIONS = [
  { label: 'Toutes', value: 'all' },
  { label: 'Envoyées', value: 'Envoyée' },
  { label: 'En révision', value: 'revision' },
  { label: 'Question posée', value: 'Question posée' },
  { label: 'Complétées', value: 'Complétée' },
  { label: 'Supprimées', value: 'Supprimée' },
];

function AdminDashboardPage({ onLogout, onViewRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
const [statusPopover, setStatusPopover] = useState(null); // { requestId, newStatusId, currentName, newName }
  const [pickerOpenId, setPickerOpenId] = useState(null); // requestId of the open picker

// === BLOCK: LOAD ALL REQUESTS — START === //
  useEffect(() => {
    const token = localStorage.getItem('lexy_token');
    fetch('http://localhost:3000/api/admin/requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('ADMIN FETCH RESULT:', data);
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log('ADMIN FETCH ERROR:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  // === BLOCK: LOAD ALL REQUESTS — END === //

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // === BLOCK: STATUS UPDATE HANDLER — START === //
  async function handleStatusChange(e, requestId) {
    e.stopPropagation();
    const token = localStorage.getItem('lexy_token');
    const newStatusId = Number(e.target.value);
    setUpdatingId(requestId);
    try {
      const result = await updateRequestStatus(requestId, newStatusId, token);
      setRequests((prev) =>
        prev.map((r) => (r.RequestId === requestId ? result.request : r))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }
  // === BLOCK: STATUS UPDATE HANDLER — END === //

  // === BLOCK: STATUS CONFIRM HANDLER — START === //
  async function handleStatusConfirm() {
    if (!statusPopover) return;
    const token = localStorage.getItem('lexy_token');
    setUpdatingId(statusPopover.requestId);
    setStatusPopover(null);
    try {
      const result = await updateRequestStatus(statusPopover.requestId, statusPopover.newStatusId, token);
      setRequests((prev) =>
        prev.map((r) => (r.RequestId === statusPopover.requestId ? result.request : r))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }
  // === BLOCK: STATUS CONFIRM HANDLER — END === //

  // === BLOCK: FILTER LOGIC — START === //
  const REVISION_STATUSES = ['En attente de révision', "En attente d'approbation"];

  const visibleRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'revision') return REVISION_STATUSES.includes(r.RequestStatuses?.StatusName);
    return r.RequestStatuses?.StatusName === activeFilter;
  });
  // === BLOCK: FILTER LOGIC — END === //

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-bg"></div>
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <div className="logo-mark">L</div>
            <div>
              <div className="logo-name">LexY</div>
              <div className="logo-tagline">ADMIN</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">Toutes les demandes</a>
          </nav>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="greeting">Portail administrateur</h1>
            <p className="greeting-sub">Gérez toutes les demandes clients.</p>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-avatar"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>A</div>
              <span>Admin</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </header>

        <main className="content">

          {/* === BLOCK: SUMMARY COUNTS — START === */}
          <div className="admin-counts">
            <div className="admin-count-pill">
              <span className="admin-count-num">{requests.length}</span>
              <span className="admin-count-label">Total</span>
            </div>
            <div className="admin-count-pill" style={{ borderColor: '#F59E0B' }}>
              <span className="admin-count-num" style={{ color: '#92400E' }}>
                {requests.filter(r => r.RequestStatuses?.StatusName === 'Envoyée').length}
              </span>
              <span className="admin-count-label">Envoyées</span>
            </div>
            <div className="admin-count-pill" style={{ borderColor: '#3B82F6' }}>
              <span className="admin-count-num" style={{ color: '#1E40AF' }}>
                {requests.filter(r => r.RequestStatuses?.StatusName === 'En cours').length}
              </span>
              <span className="admin-count-label">En cours</span>
            </div>
            <div className="admin-count-pill" style={{ borderColor: '#22C55E' }}>
              <span className="admin-count-num" style={{ color: '#166534' }}>
                {requests.filter(r => r.RequestStatuses?.StatusName === 'Complétée').length}
              </span>
              <span className="admin-count-label">Complétées</span>
            </div>
          </div>
          {/* === BLOCK: SUMMARY COUNTS — END === */}

          {/* === BLOCK: FILTER CHIPS — START === */}
          <div className="filter-chips-row" style={{ marginBottom: '20px' }}>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                className={`filter-chip ${activeFilter === f.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* === BLOCK: FILTER CHIPS — END === */}

          {error && <div className="requests-error">{error}</div>}
          {loading && <p className="requests-empty">Chargement des demandes...</p>}

          {!loading && !error && visibleRequests.length === 0 && (
            <p className="requests-empty">Aucune demande pour ce filtre.</p>
          )}

          {/* === BLOCK: ADMIN REQUEST LIST — START === */}
          {!loading && !error && visibleRequests.length > 0 && (
            <div className="admin-requests-list">
              {visibleRequests.map((request) => {
                const statusStyle = STATUS_COLORS[request.RequestStatuses?.StatusName]
                  || { bg: '#F3F4F6', color: '#6B7280' };
                return (
                  <div
                    className="admin-request-card"
                    key={request.RequestId}
                    onClick={() => onViewRequest(request.RequestId)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Row 1: Icon + Title + Code + Client + Status */}
                    <div className="admin-card-row1">
                      <div className="service-icon-sm">
                        {SERVICE_ICONS[request.ServiceTypes?.TypeName] || '✨'}
                      </div>
                      <div className="admin-card-identity">
                        <div className="admin-card-title">{request.Title}</div>
                        <div className="admin-card-meta">
                          <span className="admin-card-code">{request.RequestCode}</span>
                          <span className="admin-card-sep">·</span>
                          <span className="admin-card-client">
                            👤 {request.Users?.FirstName} {request.Users?.LastName}
                          </span>
                          <span className="admin-card-sep">·</span>
                          <span className="admin-card-date">
                            Créée le {formatDate(request.CreatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="status-pill-wrapper" onClick={(e) => e.stopPropagation()}>
                        <span
                          className="admin-status-pill"
                          style={{ background: statusStyle.bg, color: statusStyle.color, cursor: 'pointer' }}
                          onClick={() => setPickerOpenId(
                            pickerOpenId === request.RequestId ? null : request.RequestId
                          )}
                          title="Cliquer pour changer le statut"
                        >
                          {updatingId === request.RequestId ? '...' : request.RequestStatuses?.StatusName} ▾
                        </span>

                        {pickerOpenId === request.RequestId && (
                          <div className="status-picker-popover">
                            {ALL_STATUSES.filter(s => s.StatusId !== request.StatusId).map((s) => (
                              <div
                                key={s.StatusId}
                                className="status-picker-option"
                                onClick={() => {
                                  setPickerOpenId(null);
                                  setStatusPopover({
                                    requestId: request.RequestId,
                                    newStatusId: s.StatusId,
                                    currentName: request.RequestStatuses?.StatusName,
                                    newName: s.StatusName
                                  });
                                }}
                              >
                                {s.StatusName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
{/* Row 2 removed — status pill is now the trigger */}
                    
                  </div>
                );
              })}
            </div>
          )}
          {/* === BLOCK: ADMIN REQUEST LIST — END === */}
{/* === BLOCK: STATUS CONFIRM MODAL — START === */}
          {statusPopover && (
            <div className="status-modal-overlay" onClick={() => setStatusPopover(null)}>
              <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="status-modal-title">Confirmer le changement</h3>
                <p className="status-modal-body">
                  Changer le statut de <strong>{statusPopover.currentName}</strong> à <strong>{statusPopover.newName}</strong> ?
                </p>
                <div className="status-modal-actions">
                  <button className="popover-cancel" onClick={() => setStatusPopover(null)}>
                    Annuler
                  </button>
                  <button className="status-modal-confirm" onClick={handleStatusConfirm}>
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* === BLOCK: STATUS CONFIRM MODAL — END === */}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
