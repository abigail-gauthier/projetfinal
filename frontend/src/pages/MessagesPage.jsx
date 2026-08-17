import './PlaceholderPage.css';

function MessagesPage({ onNavigate, onLogout }) {
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const firstName = user?.firstName || 'invité';
  const initial = firstName.charAt(0).toUpperCase();

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
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigate('livrables'); }}>Livrables</a>
            <a href="#" className="nav-item active">Messages</a>
          </nav>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="greeting">Messages</h1>
            <p className="greeting-sub">Vos échanges avec votre agent dédié.</p>
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
          <div className="placeholder-container">
            <div className="placeholder-icon">💬</div>
            <h2 className="placeholder-title">Messagerie à venir</h2>
            <p className="placeholder-sub">
              La messagerie avec votre agent sera disponible prochainement.
              En attendant, votre agent peut vous contacter directement par courriel.
            </p>
          </div>
        </main>
      </div>

    </div>
  );
}

export default MessagesPage;