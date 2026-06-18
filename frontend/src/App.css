import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  // On app load: if a token already exists, go straight to the dashboard
  useEffect(() => {
    const token = localStorage.getItem('lexy_token');
    if (token) {
      setCurrentPage('dashboard');
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('lexy_token');
    localStorage.removeItem('lexy_user');
    setCurrentPage('login');
  }

  function handleLoginSuccess() {
    setCurrentPage('dashboard');
  }

  if (currentPage === 'dashboard') {
    return <DashboardPage onLogout={handleLogout} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />;
  }

  return (
    <LoginPage
      onSwitchToRegister={() => setCurrentPage('register')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;