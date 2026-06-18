function DashboardPage({ onLogout }) {
  // Get the stored user info from localStorage
  const userJson = localStorage.getItem('lexy_user');
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Tableau de bord</h1>
      {user ? (
        <p>Bonjour, <strong>{user.firstName}</strong> — vous êtes connecté.</p>
      ) : (
        <p>Aucun utilisateur connecté.</p>
      )}
      <button
        onClick={onLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#1A2B4A',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}

export default DashboardPage;