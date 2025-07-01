import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Modal from './components/Modal';


import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateQuotePage from './pages/CreateQuotePage';
import EditQuotePage from './pages/EditQuotePage';
import ProfilePage from './pages/ProfilePage';
import CollectionDetailPage from './pages/CollectionDetailPage';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleCreateSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <Router>
      <Navbar openCreateModal={() => setIsModalOpen(true)} />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateQuotePage onSuccess={handleCreateSuccess} />
      </Modal>

      <main style={{ padding: '2rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <CreateQuotePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditQuotePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <CollectionDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;