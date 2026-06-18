import { useState } from 'react';
import { createRequest } from '../services/requestService';
import './NewRequestPage.css';

const SERVICE_TYPES = [
  { id: 1, label: 'Voyage' },
  { id: 2, label: 'Réservation' },
  { id: 3, label: 'Recherche' },
  { id: 4, label: 'Tâche admin.' },
  { id: 5, label: 'Autre' }
];

const PREFERENCES_LIST = [
  'Petit-déjeuner inclus',
  'Salle de sport',
  'Vue sur la ville',
  'Annulation gratuite',
  'Parking',
  'Animaux acceptés'
];

function NewRequestPage({ onBackToDashboard, onLogout }) {
  // Get the stored user info
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

  // Form state
  const [serviceTypeId, setServiceTypeId] = useState(1);
  const [destination, setDestination] = useState('');
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function togglePreference(pref) {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('lexy_token');
      const serviceTypeLabel =
        SERVICE_TYPES.find((s) => s.id === serviceTypeId)?.label || 'Service';

      // Build a clean title from the destination
      const title = destination
        ? `${serviceTypeLabel} — ${destination}`
        : `Nouvelle demande de ${serviceTypeLabel.toLowerCase()}`;

      // Build a formatted description containing all the form info
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

      // Use the budget max as the cost (or null if not provided)
      const cost = budgetMax ? Number(budgetMax) : null;

      await createRequest(
        {
          ServiceTypeId: serviceTypeId,
          Title: title,
          Description: description,
          Cost: cost
        },
        token
      );

      onBackToDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

        {/* Top bar */}
        <header className="topbar">
          <div>
            <h1 className="greeting">Nouvelle demande de service</h1>
            <p className="greeting-sub">Décrivez votre besoin — votre agent s'occupe du reste.</p>
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

        {/* Content area */}
        <main className="content">

          {/* Service type selector */}
          <div className="service-type-row">
            <div className="form-label">TYPE DE SERVICE</div>
            <div className="type-chips">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`type-chip ${serviceTypeId === type.id ? 'active' : ''}`}
                  onClick={() => setServiceTypeId(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="request-error">{error}</div>}

          <form onSubmit={handleSubmit} className="request-form-card">

            {/* Section: Stay details */}
            <h3 className="section-title">Détails du séjour</h3>
            <div className="form-grid-2">
              <div className="form-field">
                <label>VILLE / DESTINATION</label>
                <input
                  type="text"
                  placeholder="Paris, France"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-field">
                <label>QUARTIER PRÉFÉRÉ (FACULTATIF)</label>
                <input
                  type="text"
                  placeholder="Près des Champs-Élysées"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="form-field">
                <label>DATE DE DÉPART</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  disabled={loading}
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
                    /> Fixes
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="flexibility"
                      value="flex"
                      checked={flexibility === 'flex'}
                      onChange={(e) => setFlexibility(e.target.value)}
                    /> ± 2 jours
                  </label>
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section: Room and travelers */}
            <h3 className="section-title">Chambre et voyageurs</h3>
            <div className="form-grid-3">
              <div className="form-field">
                <label>NOMBRE DE VOYAGEURS</label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)} disabled={loading}>
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
                <select value={rooms} onChange={(e) => setRooms(e.target.value)} disabled={loading}>
                  <option>1 chambre</option>
                  <option>2 chambres</option>
                  <option>3 chambres</option>
                </select>
              </div>
              <div className="form-field">
                <label>CATÉGORIE D'HÔTEL</label>
                <select value={hotelCategory} onChange={(e) => setHotelCategory(e.target.value)} disabled={loading}>
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
                  placeholder="300"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-field">
                <label>BUDGET MAXIMUM ($/NUIT)</label>
                <input
                  type="number"
                  placeholder="450"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section: Preferences */}
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
                      disabled={loading}
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
                placeholder="Idéalement un hôtel calme, proche d'une station de métro. Lit king si possible."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Action buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onBackToDashboard}
                disabled={loading}
              >
                Annuler
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer la demande →'}
              </button>
            </div>

          </form>

        </main>
      </div>

    </div>
  );
}

export default NewRequestPage;