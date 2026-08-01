import { useState, useEffect } from 'react';
import { getRequestById, updateRequest, restoreRequest } from '../services/requestService';
import './RequestDetailPage.css';
import './NewRequestPage.css';

const SERVICE_TYPES = [
  { id: 1, label: 'Voyage' },
  { id: 2, label: 'Réservation' },
  { id: 3, label: 'Recherche' },
  { id: 4, label: 'Tâche admin.' },
  { id: 5, label: 'Autre' }
];

const ROOMS_OPTIONS = ['1 chambre', '2 chambres', '3 chambres'];

const PREFERENCES_LIST = [
  'Petit-déjeuner inclus',
  'Salle de gym',
  'Vue sur la ville',
  'Annulation gratuite',
  'Parking',
  'Animaux acceptés'
];

// ─── Turn the saved Description text back into individual fields ───
function parseDescription(description) {
  const result = {
    destination: '',
    neighborhood: '',
    arrivalDate: '',
    departureDate: '',
    flexibility: 'fixed',
    travelers: '2 adultes',
    rooms: '1 chambre',
    hotelCategory: '4 à 5 étoiles',
    budgetMin: '',
    budgetMax: '',
    preferences: [],
    notes: ''
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

function RequestDetailPage({ requestId, startInEditMode, onBackToDashboard, onLogout }) {
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

  const token = localStorage.getItem('lexy_token');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

 // === BLOCK: RICH FORM FIELDS (mirrors NewRequestPage) — START === //
  const [serviceTypeId, setServiceTypeId] = useState(1);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  // === BLOCK: RICH FORM FIELDS — END === //
  const [neighborhood, setNeighborhood] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [flexibility, setFlexibility] = useState('fixed');
  const [travelers, setTravelers] = useState('2 adultes');
  const [rooms, setRooms] = useState('1 chambre');
  const [hotelCategory, setHotelCategory] = useState('4 à 5 étoiles');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadRequest() {
      try {
        const data = await getRequestById(requestId, token);
        setRequest(data.request);

        if (startInEditMode) {
          fillFormFrom(data.request);
          setIsEditing(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [requestId, token, startInEditMode]);

 function fillFormFrom(req) {
    const parsed = parseDescription(req.Description);
    setServiceTypeId(req.ServiceTypeId);
    setTitle(req.Title);
    setDestination(parsed.destination);
    setNeighborhood(parsed.neighborhood);
    setArrivalDate(parsed.arrivalDate);
    setDepartureDate(parsed.departureDate);
    setFlexibility(parsed.flexibility);
    setTravelers(parsed.travelers);
    setRooms(parsed.rooms);
    setHotelCategory(parsed.hotelCategory);
    setBudgetMin(parsed.budgetMin);
    setBudgetMax(parsed.budgetMax);
    setPreferences(parsed.preferences);
    setNotes(parsed.notes);
  }

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // === BLOCK: RESTORE HANDLER — START === //
  async function handleRestore() {
    try {
      const result = await restoreRequest(requestId, token);
      setRequest(result.request);
    } catch (err) {
      alert(err.message);
    }
  }
  // === BLOCK: RESTORE HANDLER — END === //
  function startEditing() {
    fillFormFrom(request);
    setSaveError('');
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setSaveError('');
  }

  function togglePreference(pref) {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaveError('');
    setSaving(true);

   try {
      const description = [
        `Destination : ${destination || 'non précisée'}`,
        neighborhood ? `Quartier préféré : ${neighborhood}` : null,
        `Dates : ${arrivalDate || '?'} au ${departureDate || '?'} (${flexibility === 'fixed' ? 'fixes' : '± 2 jours'})`,
        `Voyageurs : ${travelers}, ${rooms}`,
        `Catégorie : ${hotelCategory}`,
        `Budget par nuit : ${budgetMin || '?'} $ — ${budgetMax || '?'} $`,
        preferences.length > 0 ? `Préférences : ${preferences.join(', ')}` : null,
        notes ? `Notes : ${notes}` : null
      ]
        .filter(Boolean)
        .join('\n');

      const cost = budgetMax ? Number(budgetMax) : null;

      const result = await updateRequest(
        requestId,
        { ServiceTypeId: serviceTypeId, Title: title, Description: description, Cost: cost },
        token
      );
      setRequest(result.request);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onBackToDashboard(); }}>
              Tableau de bord
            </a>
            <a href="#" className="nav-item active">Mes demandes</a>
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
            <h1 className="greeting">Détails de la demande</h1>
            <p className="greeting-sub">Consulte l'état et les informations de ta demande.</p>
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

          <button className="back-link" onClick={onBackToDashboard}>
            ← Retour au tableau de bord
          </button>

          {loading && <p className="requests-empty">Chargement de la demande...</p>}

          {!loading && error && <div className="requests-error">{error}</div>}

          {/* ═════════ VIEW MODE ═════════ */}
          {!loading && !error && request && !isEditing && (
            <div className="detail-card">

              {/* === BLOCK: DELETED BANNER — START === */}
              {request.RequestStatuses?.StatusName === 'Supprimée' && (
                <div className="deleted-banner">
                  Cette demande a été supprimée.
                </div>
              )}
              {/* === BLOCK: DELETED BANNER — END === */}

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

                // === BLOCK: FIELDS ARRAY (all values, in the order you asked for) — START ===
                const fields = [
                  info.destination && { icon: '📍', label: 'Destination', value: info.destination },
                  info.neighborhood && { icon: '🏙️', label: 'Quartier', value: info.neighborhood },
                  info.arrivalDate && { icon: '📅', label: "Date d'arrivée", value: info.arrivalDate },
                  info.departureDate && { icon: '📆', label: 'Date de départ', value: info.departureDate },
                  (info.arrivalDate || info.departureDate) && {
                    icon: '🔁',
                    label: 'Flexibilité',
                    value: info.flexibility === 'flex' ? '± 2 jours' : 'Dates fixes'
                  },
                  info.travelers && { icon: '👥', label: 'Voyageurs', value: info.travelers },
                  info.rooms && { icon: '🛏️', label: 'Chambres', value: info.rooms },
                  info.hotelCategory && { icon: '⭐', label: 'Catégorie', value: info.hotelCategory },
                  info.budgetMin && { icon: '💰', label: 'Budget minimum', value: `${info.budgetMin} $ / nuit` },
                  info.budgetMax && { icon: '💵', label: 'Budget maximum', value: `${info.budgetMax} $ / nuit` }
                ].filter(Boolean);
                // === BLOCK: FIELDS ARRAY — END ===

                return (
                  <div className="info-section">
{/* === BLOCK: SECTION LABEL — DÉTAILS DE LA DEMANDE — START === */}
                    <label className="section-label section-label-first">DÉTAILS DE LA DEMANDE</label>
                    {/* === BLOCK: SECTION LABEL — DÉTAILS DE LA DEMANDE — END === */}
              {/* === BLOCK: PILL GRID CONTAINER — START === */}
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
                    {/* BLOCK: PILL GRID CONTAINER — END === */}


                    {info.preferences.length > 0 && (
                      <>
                        <label className="section-label">PRÉFÉRENCES</label>
                        <div className="preferences-wrap">
                          {info.preferences.map((pref) => (
                            <div className="preference-tag" key={pref}>{pref}</div>
                          ))}
                        </div>
                      </>
                    )}

                    {info.notes && (
                      <>
                        <label className="section-label">NOTES POUR L'AGENT</label>
                        <div className="detail-description">{info.notes}</div>
                      </>
                    )}
                  </div>
                );
              })()}

             {/* === BLOCK: VIEW-MODE ACTIONS — START === */}
              <div className="detail-actions">
                {request.RequestStatuses?.StatusName === 'Supprimée' ? (
                  <button className="restore-btn" onClick={handleRestore}>
                    ↩ Restaurer
                  </button>
                ) : (
                  <button className="edit-btn" onClick={startEditing}>
                    ✏️ Modifier
                  </button>
                )}
              </div>
              {/* === BLOCK: VIEW-MODE ACTIONS — END === */}

            </div>
          )}

          {/* ═════════ EDIT MODE — mirrors NewRequestPage ═════════ */}
          {!loading && !error && request && isEditing && request.RequestStatuses?.StatusName !== 'Supprimée' && (
            <>
              <div className="detail-header-row" style={{ marginBottom: '20px' }}>
                <div>
                  <div className="detail-code">{request.RequestCode}</div>
                  <h2 className="detail-title">{request.Title}</h2>
                </div>
                <span className="request-item-status">
                  {request.RequestStatuses?.StatusName}
                </span>
              </div>

              <div className="service-type-row">
                <div className="form-label">TYPE DE SERVICE</div>
                <div className="type-chips">
                  {SERVICE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-chip ${serviceTypeId === type.id ? 'active' : ''}`}
                      onClick={() => setServiceTypeId(type.id)}
                      disabled={saving}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <div className="request-error">{saveError}</div>}

             <form onSubmit={handleSave} className="request-form-card">

                {/* === BLOCK: TITLE FIELD (EDIT MODE) — START === */}
                <div className="form-field" style={{ marginBottom: '24px' }}>
                  <label>TITRE DE LA DEMANDE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={saving}
                  />
                </div>
                {/* === BLOCK: TITLE FIELD (EDIT MODE) — END === */}

                <h3 className="section-title">Détails du séjour</h3>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>VILLE / DESTINATION</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-field">
                    <label>QUARTIER PRÉFÉRÉ (FACULTATIF)</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label>DATE D'ARRIVÉE</label>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-field">
                    <label>DATE DE DÉPART</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-field">
                    <label>FLEXIBILITÉ DES DATES</label>
                    <div className="radio-row">
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="flexibility"
                          value="fixed"
                          checked={flexibility === 'fixed'}
                          onChange={(e) => setFlexibility(e.target.value)}
                          disabled={saving}
                        /> Fixes
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="flexibility"
                          value="flex"
                          checked={flexibility === 'flex'}
                          onChange={(e) => setFlexibility(e.target.value)}
                          disabled={saving}
                        /> ± 2 jours
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="section-divider" />

                <h3 className="section-title">Chambre et voyageurs</h3>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label>NOMBRE DE VOYAGEURS</label>
                    <select value={travelers} onChange={(e) => setTravelers(e.target.value)} disabled={saving}>
                      <option>1 adulte</option>
                      <option>2 adultes</option>
                      <option>3 adultes</option>
                      <option>4 adultes</option>
                      <option>2 adultes, 1 enfant</option>
                      <option>2 adultes, 2 enfants</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>NOMBRE DE CHAMBRES</label>
                    <select value={rooms} onChange={(e) => setRooms(e.target.value)} disabled={saving}>
                      <option>1 chambre</option>
                      <option>2 chambres</option>
                      <option>3 chambres</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>CATÉGORIE D'HÔTEL</label>
                    <select value={hotelCategory} onChange={(e) => setHotelCategory(e.target.value)} disabled={saving}>
                      <option>3 étoiles</option>
                      <option>4 étoiles</option>
                      <option>4 à 5 étoiles</option>
                      <option>5 étoiles</option>
                      <option>Boutique</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>BUDGET MINIMUM ($/NUIT)</label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-field">
                    <label>BUDGET MAXIMUM ($/NUIT)</label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <hr className="section-divider" />

                <h3 className="section-title">Préférences et précisions</h3>
                <div className="form-field">
                  <label>PRÉFÉRENCES (PLUSIEURS CHOIX POSSIBLES)</label>
                  <div className="preferences-grid">
                    {PREFERENCES_LIST.map((pref) => (
                      <label key={pref} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={preferences.includes(pref)}
                          onChange={() => togglePreference(pref)}
                          disabled={saving}
                        />
                        {pref}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>PRÉCISIONS POUR VOTRE AGENT (FACULTATIF)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={cancelEditing} disabled={saving}>
                    Annuler
                  </button>
                  <button type="submit" className="submit-btn" disabled={saving}>
                    {saving ? 'Sauvegarde en cours...' : 'Sauvegarder →'}
                  </button>
                </div>

              </form>
            </>
          )}

        </main>
      </div>

    </div>
  );
}

export default RequestDetailPage;