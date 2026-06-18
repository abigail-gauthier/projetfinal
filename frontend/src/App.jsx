import { useState, useEffect } from 'react';

function App() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/test')
      .then(response => response.json())
      .then(data => setRoles(data.roles))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>LexY — Test de connexion</h1>
      <p>Cette page récupère les rôles depuis le backend.</p>

      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      <h2>Rôles :</h2>
      <ul>
        {roles.map(role => (
          <li key={role.RoleId}>
            {role.RoleId} — {role.RoleName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;