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

  // === BLOCK: REMEMBER WHICH DASHBOARD VIEW WE CAME FROM — START === //
  const [returnToDeleted, setReturnToDeleted] = useState(false);
  // === BLOCK: REMEMBER WHICH DASHBOARD VIEW WE CAME FROM — END === //

  function handleLogout() {
    localStorage.removeItem('lexy_token');
    localStorage.removeItem('lexy_user');
    setCurrentPage('login');
  }

  function handleLoginSuccess() {
    setCurrentPage('dashboard');
  }

  function handleViewRequest(requestId, fromDeleted = false) {
    setSelectedRequestId(requestId);
    setOpenInEditMode(false);
    setReturnToDeleted(fromDeleted);
    setCurrentPage('request-detail');
  }

  function handleEditRequest(requestId) {
    setSelectedRequestId(requestId);
    setOpenInEditMode(true);
    setReturnToDeleted(false);
    setCurrentPage('request-detail');
  }

  function handleBackToDashboard() {
    setCurrentPage('dashboard');
  }

  if (currentPage === 'dashboard') {
    return (
      <DashboardPage
        onLogout={handleLogout}
        onNewRequest={() => setCurrentPage('new-request')}
        onViewRequest={handleViewRequest}
        onEditRequest={handleEditRequest}
        initialShowDeleted={returnToDeleted}
      />
    );
  }

  if (currentPage === 'new-request') {
    return (
      <NewRequestPage
        onBackToDashboard={handleBackToDashboard}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'request-detail') {
    return (
      <RequestDetailPage
        requestId={selectedRequestId}
        startInEditMode={openInEditMode}
        onBackToDashboard={handleBackToDashboard}
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