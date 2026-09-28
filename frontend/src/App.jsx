/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import { useDisasterStore } from './store/disasterStore';
import Navbar from './components/Navbar';
import LoginView from './pages/LoginView';
import DashboardView from './pages/DashboardView';
import MapView from './pages/MapView';
import DisasterDetailModal from './components/DisasterDetailModal';
import CreateDisasterModal from './components/CreateDisasterModal';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { connected, liveEvents, joinDisasterRoom, leaveDisasterRoom } = useSocket();
  const { fetchDisasters } = useDisasterStore();

  // If unauthenticated, present the Hallmark Access Console
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-paper)',
      color: 'var(--color-text-primary)'
    }}>
      {/* Hallmark Command Console Shell Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        isSocketConnected={connected}
      />

      {/* Main Operations Views */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'dashboard' ? (
          <DashboardView
            onSelectDisaster={(disaster) => setSelectedDisaster(disaster)}
            liveEvents={liveEvents}
            isSocketConnected={connected}
          />
        ) : (
          <MapView onSelectDisaster={(disaster) => setSelectedDisaster(disaster)} />
        )}
      </main>

      {/* 04 · Incident Details Modal */}
      {selectedDisaster && (
        <DisasterDetailModal
          disaster={selectedDisaster}
          onClose={() => setSelectedDisaster(null)}
          onJoinRoom={joinDisasterRoom}
          onLeaveRoom={leaveDisasterRoom}
        />
      )}

      {/* 05 · Incident Registration Modal */}
      {isCreateModalOpen && (
        <CreateDisasterModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchDisasters()}
        />
      )}
    </div>
  );
}
