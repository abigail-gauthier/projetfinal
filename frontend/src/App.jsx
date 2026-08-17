import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import MesDemandesPage from './pages/MesDemandesPage';
import LivrablePage from './pages/LivrablePage';
import MessagesPage from './pages/MessagesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRequestDetailPage from './pages/AdminRequestDetailPage';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem('lexy_token');
    if (!token) return 'login';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roleId === 2 ? 'admin' : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [returnToDeleted, setReturnToDeleted] = useState(false);
  // === BLOCK: RETURN PAGE STATE — START === //
  const [returnToPage, setReturnToPage] = useState('dashboard');
  // === BLOCK: RETURN PAGE STATE — END === //
const [selectedAdminRequestId, setSelectedAdminRequestId] = useState(null);
  function handleLogout() {
    localStorage.removeItem('lexy_token');
    localStorage.removeItem('lexy_user');
    setCurrentPage('login');
  }

  function handleLoginSuccess(roleId) {
    if (roleId === 2) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  }

function handleViewRequest(requestId, fromDeleted = false, from = 'dashboard') {
    setSelectedRequestId(requestId);
    setOpenInEditMode(false);
    setReturnToDeleted(fromDeleted);
    setReturnToPage(from);
    setCurrentPage('request-detail');
  }

  function handleEditRequest(requestId, from = 'dashboard') {
    setSelectedRequestId(requestId);
    setOpenInEditMode(true);
    setReturnToDeleted(false);
    setReturnToPage(from);
    setCurrentPage('request-detail');
  }

  function handleBackToDashboard() {
    setCurrentPage(returnToPage);
  }

  // === BLOCK: NAVIGATE HANDLER (for sidebar links) — START === //
  function handleNavigate(page) {
    setCurrentPage(page);
  }
  // === BLOCK: NAVIGATE HANDLER — END === //

  if (currentPage === 'dashboard') {
    return (
      <DashboardPage
        onLogout={handleLogout}
        onNewRequest={() => setCurrentPage('new-request')}
        onViewRequest={handleViewRequest}
        onEditRequest={handleEditRequest}
        initialShowDeleted={returnToDeleted}
        onNavigate={handleNavigate}
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

  // === BLOCK: NEW PAGE ROUTES — START === //
 if (currentPage === 'mes-demandes') {
    return (
      <MesDemandesPage
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onViewRequest={(id, fromDeleted) => handleViewRequest(id, fromDeleted, 'mes-demandes')}
        onEditRequest={(id) => handleEditRequest(id, 'mes-demandes')}
      />
    );
  }

  if (currentPage === 'livrables') {
    return (
      <LivrablePage
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

 
  // === BLOCK: NEW PAGE ROUTES — END === //

  // === BLOCK: ADMIN ROUTES — START === //
  if (currentPage === 'admin') {
    return (
      <AdminDashboardPage
        onLogout={handleLogout}
        onViewRequest={(id) => {
          setSelectedAdminRequestId(id);
          setCurrentPage('admin-request-detail');
        }}
      />
    );
  }

  if (currentPage === 'admin-request-detail') {
    return (
      <AdminRequestDetailPage
        requestId={selectedAdminRequestId}
        onBack={() => setCurrentPage('admin')}
        onLogout={handleLogout}
        onViewUser={(userId) => {
          console.log('View user:', userId);
        }}
      />
    );
  }
  // === BLOCK: ADMIN ROUTES — END === //
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