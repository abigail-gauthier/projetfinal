import { useState, useEffect } from 'react';
import { getMyRequests, getDeliverables } from '../services/requestService';
import './LivrablePage.css';

// Show everything except: Brouillon(1), En attente(7), Supprimée(10)
// UNLESS the request has a deliverable — then always show it
const EXCLUDED_STATUS_IDS = [1, 7, 10];

const SERVICE_ICONS = {
  'Voyage': '✈️',
  'Réservation': '🍽️',
  'Recherche': '🔍',
  'Tâche admin.': '✏️',
  'Autre': '✨',
};

function LivrablePage({ onNavigate, onLogout }) {
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

  const token = localStorage.getItem('lexy_token');
  const [requests, setRequests] = useState([]);
  const [deliverablesByRequest, setDeliverablesByRequest] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMyRequests(token);

        // Fetch deliverables for ALL requests first
        const delivMap = {};
        await Promise.all(
          data.requests.map(async (r) => {
            try {
              const d = await getDeliverables(r.RequestId, token);
              delivMap[r.RequestId] = d.deliverables || [];
            } catch {
              delivMap[r.RequestId] = [];
            }
          })
        );

        // Show request if status is not excluded OR if it has a deliverable
        const visibleRequests = data.requests.filter((r) =>
          !EXCLUDED_STATUS_IDS.includes(r.StatusId) ||
          (delivMap[r.RequestId]?.length > 0)
        );

        setRequests(visibleRequests);
        setDeliverablesByRequest(delivMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function renderFilePreview(deliverable) {
    const fileUrl = 'http://localhost:3000/api/deliverables/file/' + deliverable.FileName;
    const mime = deliverable.MimeType || '';

    if (mime.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={deliverable.OriginalName}
          className="livrable-preview-image"
        />
      );
    }
    if (mime === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="livrable-preview-pdf"
          title={deliverable.OriginalName}
        />
      );
    }
    return (
      <div className="livrable-preview-other">
        <span>&#128196;</span>
        <span>{deliverable.OriginalName}</span>
      </div>
    );
  }

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
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigate('mes-demandes'); }}>Mes demandes</a>
            <a href="#" className="nav-item active">Livrables</a>
          </nav>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="greeting">Livrables</h1>
            <p className="greeting-sub">Les documents et recommandations préparés par votre agent.</p>
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

          {error && <div className="requests-error">{error}</div>}
          {loading && <p className="requests-empty">Chargement de vos livrables...</p>}

          {!loading && !error && requests.length === 0 && (
            <div className="livrable-empty-state">
              <div className="livrable-empty-icon">🎁</div>
              <h2 className="livrable-empty-title">Aucune demande envoyée</h2>
              <p className="livrable-empty-sub">
                Vos livrables apparaîtront ici une fois que vous aurez envoyé une demande à votre agent.
              </p>
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div className="livrable-grid">
              {requests.map((request) => {
                const delivs = deliverablesByRequest[request.RequestId] || [];
                return (
                  <div className="livrable-card" key={request.RequestId}>

                    <div className="livrable-card-header">
                      <div className="livrable-service-icon">
                        {SERVICE_ICONS[request.ServiceTypes?.TypeName] || '✨'}
                      </div>
                      <div className="livrable-card-identity">
                        <div className="livrable-card-title">{request.Title}</div>
                        <div className="livrable-card-code">{request.RequestCode}</div>
                      </div>
                      <span className="request-item-status">
                        {request.RequestStatuses?.StatusName}
                      </span>
                    </div>

                    <div className="livrable-card-date">
                      Envoyée le {formatDate(request.CreatedAt)}
                    </div>

                    {delivs.length === 0 ? (
                      <div className="livrable-placeholder">
                        <span className="livrable-placeholder-icon">📋</span>
                        <span className="livrable-placeholder-text">
                          Aucun livrable pour le moment — votre agent y travaille.
                        </span>
                      </div>
                    ) : (
                      <div className="livrable-deliverables">
                        {delivs.map((d) => {
                          const fileUrl = 'http://localhost:3000/api/deliverables/file/' + d.FileName;
                          return (
                            <div className="livrable-deliv-item" key={d.DeliverableId}>
                              <div className="livrable-deliv-header">
                                <div className="livrable-deliv-title">{d.Title}</div>
                                <a
                                  href={fileUrl}
                                  download={d.OriginalName}
                                  className="livrable-download-btn"
                                >
                                  Télécharger
                                </a>
                              </div>
                              {d.Note && (
                                <div className="livrable-deliv-note">{d.Note}</div>
                              )}
                              <div className="livrable-deliv-meta">
                                {d.OriginalName} · Reçu le {formatDate(d.CreatedAt)}
                              </div>
                              <div className="livrable-preview">
                                {renderFilePreview(d)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default LivrablePage;
