import './DashboardPage.css';

function DashboardPage({ onLogout }) {
  // Get the stored user info from localStorage
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

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

        {/* Top bar */}
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

        {/* Content area */}
        <main className="content">

          {/* Hero banner */}
          <section className="hero-banner">
            <div className="hero-bg"></div>
            <div className="hero-content">
              <h2>Besoin d'un service ?</h2>
              <p>
                Soumettez une demande et votre agent dédié s'en occupe — voyage,
                réservation, recherche, et plus.
              </p>
              <button className="hero-btn">+  Nouvelle demande</button>
            </div>
          </section>

          {/* Stat cards */}
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

        </main>
      </div>

    </div>
  );
}

export default DashboardPage;