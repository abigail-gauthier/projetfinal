import { useState } from 'react';
import { loginUser } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // Store the token in localStorage
      localStorage.setItem('lexy_token', data.token);
      localStorage.setItem('lexy_user', JSON.stringify(data.user));

      // For now, show success in the console
      console.log('Connexion réussie !', data);
      alert(`Bienvenue, ${data.user.firstName} !`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-mark">L</div>
          <h1>LexY</h1>
          <p className="tagline">EXECUTIVE SERVICE</p>
        </div>

        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">Bienvenue. Connectez-vous à votre compte.</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Courriel</label>
          <input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-footer">
          Pas encore de compte ? <a href="#">Créer un compte</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;