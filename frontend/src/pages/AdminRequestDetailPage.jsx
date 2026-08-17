import { useState, useEffect } from 'react';
import { getRequestByIdAdmin, updateRequestStatus, createDeliverable, getDeliverables } from '../services/requestService';
import './AdminRequestDetailPage.css';
import './RequestDetailPage.css';

const ALL_STATUSES = [
  { StatusId: 2, StatusName: 'Envoyée' },
  { StatusId: 3, StatusName: 'En attente de révision' },
  { StatusId: 4, StatusName: "En attente d'approbation" },
  { StatusId: 5, StatusName: 'En cours' },
  { StatusId: 6, StatusName: 'Question posée' },
  { StatusId: 9, StatusName: 'Complétée' },
  { StatusId: 8, StatusName: 'Annulée' },
];

const ROOMS_OPTIONS = ['1 chambre', '2 chambres', '3 chambres'];

function parseDescription(description) {
  const result = {
    destination: '', neighborhood: '', arrivalDate: '', departureDate: '',
    flexibility: 'fixed', travelers: '2 adultes', rooms: '1 chambre',
    hotelCategory: '4 à 5 étoiles', budgetMin: '', budgetMax: '',
    preferences: [], notes: ''
  };
  if (!description) return result;
  const lines = description.split('\n');
  for (const line of lines) {
    if (line.startsWith('Destination : ')) {
      const val = line.replace('Destination : ', '').trim();
      result.destination = val === 'non précisée' ? '' : val;
    } else if (line.startsWith('Quartier préféré : ')) {
      result.neighborhood = line.replace('Quartier préféré : ', '').trim();
    } else if (line.startsWith('Dates : ')) {
      const rest = line.replace('Dates : ', '').trim();
      const match = rest.match(/^(.*)\sau\s(.*)\s\((.*)\)$/);
      if (match) {
        result.arrivalDate = match[1] === '?' ? '' : match[1];
        result.departureDate = match[2] === '?' ? '' : match[2];
        result.flexibility = match[3].includes('fixes') ? 'fixed' : 'flex';
      }
    } else if (line.startsWith('Voyageurs : ')) {
      const rest = line.replace('Voyageurs : ', '').trim();
      const foundRoom = ROOMS_OPTIONS.find((r) => rest.endsWith(r));
      if (foundRoom) {
        result.rooms = foundRoom;
        result.travelers = rest.slice(0, rest.length - foundRoom.length).replace(/,\s*$/, '').trim();
      } else {
        result.travelers = rest;
      }
    } else if (line.startsWith('Catégorie : ')) {
      result.hotelCategory = line.replace('Catégorie : ', '').trim();
    } else if (line.startsWith('Budget par nuit : ')) {
      const rest = line.replace('Budget par nuit : ', '').trim();
      const match = rest.match(/^(.*?)\s\$\s—\s(.*?)\s\$$/);
      if (match) {
        result.budgetMin = match[1] === '?' ? '' : match[1];
        result.budgetMax = match[2] === '?' ? '' : match[2];
      }
    } else if (line.startsWith('Préférences : ')) {
      result.preferences = line.replace('Préférences : ', '').split(', ').map((s) => s.trim());
    } else if (line.startsWith('Notes : ')) {
      result.notes = line.replace('Notes : ', '').trim();
    }
  }
  return result;
}

function AdminRequestDetailPage({ requestId, onBack, onLogout, onViewUser }) {
  const token = localStorage.getItem('lexy_token');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // === BLOCK: DELIVERABLE STATE — START === //
  const [deliverables, setDeliverables] = useState([]);
  const [delivTitle, setDelivTitle] = useState('');
  const [delivNote, setDelivNote] = useState('');
  const [delivFile, setDelivFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  // === BLOCK: DELIVERABLE STATE — END === //

  useEffect(() => {
    async function load() {
      try {
        const [reqData, delivData] = await Promise.all([
          getRequestByIdAdmin(requestId, token),
          getDeliverables(requestId, token)
        ]);
        setRequest(reqData.request);
        setDeliverables(delivData.deliverables || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestId, token]);

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  async function handleStatusChange(newStatusId) {
    setUpdating(true);
    try {
      const result = await updateRequestStatus(requestId, newStatusId, token);
      setRequest(result.request);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  // === BLOCK: UPLOAD HANDLER — START === //
  async function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!delivFile) { setUploadError('Veuillez choisir un fichier.'); return; }
    if (!delivTitle.trim()) { setUploadError('Le titre est obligatoire.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', delivFile);
      formData.append('title', delivTitle);
      formData.append('note', delivNote);

      const result = await createDeliverable(requestId, formData, token);
      setDeliverables((prev) => [result.deliverable, ...prev]);
      setDelivTitle('');
      setDelivNote('');
      setDelivFile(null);
      setUploadSuccess(true);
      const fileInput = document.getElementById('deliverable-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }
  // === BLOCK: UPLOAD HANDLER — END === //

  // === BLOCK: FILE PREVIEW RENDERER — START === //
  function renderFilePreview(deliverable) {
    const fileUrl = `http://localhost:3000/api/deliverables/file/${deliverable.FileName}`;
    const mime = deliverable.MimeType || '';

    if (mime.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={deliverable.OriginalName}
          className="deliv-preview-image"
        />
      );
    }
    if (mime === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="deliv-preview-pdf"
          title={deliverable.OriginalName}
        />
      );
    }
    return (
      <div className="deliv-preview-other">
        <span role="img" aria-label="file">&#128196;</span>
        <span>{deliverable.OriginalName}</span>
      </div>
    );
  }
  // === BLOCK: FILE PREVIEW RENDERER — END === //

  return (
    <div className="dashboard">

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
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onBack(); }}>
              Toutes les demandes
            </a>
          </nav>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="greeting">Détail de la demande</h1>
            <p className="greeting-sub">Vue administrateur</p>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-avatar"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>A</div>
              <span>Admin</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>Se déconnecter</button>
          </div>
        </header>

        <main className="content">
          <button className="back-link" onClick={onBack}>Retour</button>

          {loading && <p className="requests-empty">Chargement...</p>}
          {!loading && error && <div className="requests-error">{error}</div>}

          {!loading && !error && request && (
            <div>
              {/* === BLOCK: CLIENT INFO CARD — START === */}
              <div className="admin-client-card">
                <div className="admin-client-avatar">
                  {request.Users?.FirstName?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-client-info">
                  <div className="admin-client-name">
                    {request.Users?.FirstName} {request.Users?.LastName}
                  </div>
                  <div className="admin-client-email">{request.Users?.Email}</div>
                  {request.Users?.Phone && (
                    <div className="admin-client-phone">{request.Users?.Phone}</div>
                  )}
                </div>
                <button
                  className="admin-view-profile-btn"
                  onClick={() => onViewUser(request.Users?.UserId)}
                >
                  Voir le profil
                </button>
              </div>
              {/* === BLOCK: CLIENT INFO CARD — END === */}

              {/* === BLOCK: REQUEST DETAIL CARD — START === */}
              <div className="detail-card" style={{ marginTop: '20px' }}>
                <div className="detail-header-row">
                  <div>
                    <div className="detail-code">{request.RequestCode}</div>
                    <h2 className="detail-title">{request.Title}</h2>
                  </div>
                  <span className="request-item-status">
                    {request.RequestStatuses?.StatusName}
                  </span>
                </div>

                <div className="detail-grid">
                  <div className="detail-field">
                    <label>TYPE DE SERVICE</label>
                    <div className="detail-value">{request.ServiceTypes?.TypeName}</div>
                  </div>
                  <div className="detail-field">
                    <label>BUDGET</label>
                    <div className="detail-value">
                      {request.Cost !== null ? `${request.Cost} $` : 'Non précisé'}
                    </div>
                  </div>
                  <div className="detail-field">
                    <label>CRÉÉE LE</label>
                    <div className="detail-value">{formatDate(request.CreatedAt)}</div>
                  </div>
                  <div className="detail-field">
                    <label>DERNIÈRE MODIFICATION</label>
                    <div className="detail-value">
                      {request.LastModifiedAt ? formatDate(request.LastModifiedAt) : 'Aucune'}
                    </div>
                  </div>
                </div>

                {(() => {
                  const info = parseDescription(request.Description);
                  const fields = [
                    info.destination && { icon: '📍', label: 'Destination', value: info.destination },
                    info.neighborhood && { icon: '🏙️', label: 'Quartier', value: info.neighborhood },
                    info.arrivalDate && { icon: '📅', label: "Date d'arrivée", value: info.arrivalDate },
                    info.departureDate && { icon: '📆', label: 'Date de départ', value: info.departureDate },
                    (info.arrivalDate || info.departureDate) && {
                      icon: '🔁', label: 'Flexibilité',
                      value: info.flexibility === 'flex' ? '± 2 jours' : 'Dates fixes'
                    },
                    info.travelers && { icon: '👥', label: 'Voyageurs', value: info.travelers },
                    info.rooms && { icon: '🛏️', label: 'Chambres', value: info.rooms },
                    info.hotelCategory && { icon: '⭐', label: 'Catégorie', value: info.hotelCategory },
                    info.budgetMin && { icon: '💰', label: 'Budget minimum', value: `${info.budgetMin} $ / nuit` },
                    info.budgetMax && { icon: '💵', label: 'Budget maximum', value: `${info.budgetMax} $ / nuit` },
                  ].filter(Boolean);

                  return (
                    <div className="info-section">
                      <label className="section-label section-label-first">DÉTAILS DE LA DEMANDE</label>
                      <div className="pill-grid">
                        {fields.map((field) => (
                          <div className="pill-pair" key={field.label}>
                            <div className="pill-label-badge">
                              <span className="pill-icon">{field.icon}</span>
                              <span>{field.label}</span>
                            </div>
                            <div className="pill-value-badge">{field.value}</div>
                          </div>
                        ))}
                      </div>
                      {info.preferences.length > 0 && (
                        <div>
                          <label className="section-label">PRÉFÉRENCES</label>
                          <div className="preferences-wrap">
                            {info.preferences.map((pref) => (
                              <div className="preference-tag" key={pref}>{pref}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {info.notes && (
                        <div>
                          <label className="section-label">NOTES DU CLIENT</label>
                          <div className="detail-description">{info.notes}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* === BLOCK: ADMIN STATUS CHANGE — START === */}
                <div className="admin-status-change-section">
                  <label className="admin-status-label">CHANGER LE STATUT</label>
                  <div className="admin-status-row">
                    <select
                      className="admin-status-select"
                      value={request.StatusId}
                      onChange={(e) => handleStatusChange(Number(e.target.value))}
                      disabled={updating}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s.StatusId} value={s.StatusId}>
                          {s.StatusName}
                        </option>
                      ))}
                    </select>
                    {updating && <span className="admin-updating">Mise à jour...</span>}
                  </div>
                </div>
                {/* === BLOCK: ADMIN STATUS CHANGE — END === */}

              </div>
              {/* === BLOCK: REQUEST DETAIL CARD — END === */}

              {/* === BLOCK: UPLOAD DELIVERABLE SECTION — START === */}
              <div className="deliv-upload-card">
                <h3 className="deliv-section-title">Envoyer un livrable</h3>

                {uploadSuccess && (
                  <div className="deliv-success">Livrable envoyé avec succès !</div>
                )}
                {uploadError && (
                  <div className="requests-error">{uploadError}</div>
                )}

                <form onSubmit={handleUpload} className="deliv-form">
                  <div className="detail-field">
                    <label>TITRE DU LIVRABLE</label>
                    <input
                      type="text"
                      value={delivTitle}
                      onChange={(e) => { setDelivTitle(e.target.value); setUploadSuccess(false); }}
                      placeholder="Ex: Hôtels recommandés — Paris"
                      disabled={uploading}
                      className="deliv-input"
                    />
                  </div>
                  <div className="detail-field">
                    <label>NOTE POUR LE CLIENT (FACULTATIF)</label>
                    <textarea
                      rows={2}
                      value={delivNote}
                      onChange={(e) => setDelivNote(e.target.value)}
                      placeholder="Ex: Voici les 3 meilleurs hôtels selon vos critères."
                      disabled={uploading}
                      className="deliv-input"
                    />
                  </div>
                  <div className="detail-field">
                    <label>FICHIER</label>
                    <input
                      id="deliverable-file-input"
                      type="file"
                      onChange={(e) => { setDelivFile(e.target.files[0]); setUploadSuccess(false); }}
                      disabled={uploading}
                      className="deliv-file-input"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4,.mp3"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      type="submit"
                      className="admin-view-profile-btn"
                      disabled={uploading}
                      style={{ background: uploading ? '#9CA3AF' : undefined }}
                    >
                      {uploading ? 'Envoi en cours...' : 'Envoyer le livrable'}
                    </button>
                  </div>
                </form>
              </div>
              {/* === BLOCK: UPLOAD DELIVERABLE SECTION — END === */}

              {/* === BLOCK: EXISTING DELIVERABLES LIST — START === */}
              {deliverables.length > 0 && (
                <div className="deliv-list-card">
                  <h3 className="deliv-section-title">Livrables envoyés</h3>
                  {deliverables.map((d) => {
                    const fileUrl = `http://localhost:3000/api/deliverables/file/${d.FileName}`;
                    return (
                      <div className="deliv-item" key={d.DeliverableId}>
                        <div className="deliv-item-header">
                          <div className="deliv-item-title">{d.Title}</div>
                          <a
                            href={fileUrl}
                            download={d.OriginalName}
                            className="deliv-download-btn"
                          >
                            Télécharger
                          </a>
                        </div>
                        {d.Note && <div className="deliv-item-note">{d.Note}</div>}
                        <div className="deliv-item-meta">
                          {d.OriginalName} · Envoyé le {formatDate(d.CreatedAt)}
                        </div>
                        <div className="deliv-preview">
                          {renderFilePreview(d)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* === BLOCK: EXISTING DELIVERABLES LIST — END === */}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminRequestDetailPage;
