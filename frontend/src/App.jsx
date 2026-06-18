import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewRequestPage from './pages/NewRequestPage';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
  return localStorage.getItem('lexy_token') ? 'dashboard' : 'login';
});


  function handleLogout() {
    localStorage.removeItem('lexy_token');
    localStorage.removeItem('lexy_user');
    setCurrentPage('login');
  }

  function handleLoginSuccess() {
    setCurrentPage('dashboard');
  }

  if (currentPage === 'dashboard') {
    return (
      <DashboardPage
        onLogout={handleLogout}
        onNewRequest={() => setCurrentPage('new-request')}
      />
    );
  }

if (currentPage === 'new-request') {
    return (
      <NewRequestPage
        onBackToDashboard={() => setCurrentPage('dashboard')}
        onLogout={handleLogout}
      />
    );
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