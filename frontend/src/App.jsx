import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('lexy_token') ? 'dashboard' : 'login';
  });

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);

  function handleLogout() {
    localStorage.removeItem('lexy_token');
    localStorage.removeItem('lexy_user');
    setCurrentPage('login');
  }

  function handleLoginSuccess() {
    setCurrentPage('dashboard');
  }

  function handleViewRequest(requestId) {
    setSelectedRequestId(requestId);
    setOpenInEditMode(false);
    setCurrentPage('request-detail');
  }

  function handleEditRequest(requestId) {
    setSelectedRequestId(requestId);
    setOpenInEditMode(true);
    setCurrentPage('request-detail');
  }

  if (currentPage === 'dashboard') {
    return (
      <DashboardPage
        onLogout={handleLogout}
        onNewRequest={() => setCurrentPage('new-request')}
        onViewRequest={handleViewRequest}
        onEditRequest={handleEditRequest}
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

  if (currentPage === 'request-detail') {
    return (
      <RequestDetailPage
        requestId={selectedRequestId}
        startInEditMode={openInEditMode}
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