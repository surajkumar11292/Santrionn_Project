import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import Navbar from './components/Navbar';
import DashboardView from './pages/DashboardView';
import MapView from './pages/MapView';
import LoginView from './pages/LoginView';
import DisasterDetailModal from './components/DisasterDetailModal';
import CreateDisasterModal from './components/CreateDisasterModal';
import { useDisasterStore } from './store/disasterStore';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { connected, liveEvents, joinDisasterRoom, leaveDisasterRoom } = useSocket();
  const { fetchDisasters } = useDisasterStore();

  // If not authenticated, show modern dark command login screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-base)' }}>
      {/* Top Operations Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        isSocketConnected={connected}
      />

      {/* Main View Area */}
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

      {/* Detail Drilldown Modal */}
      {selectedDisaster && (
        <DisasterDetailModal
          disaster={selectedDisaster}
          onClose={() => setSelectedDisaster(null)}
          onJoinRoom={joinDisasterRoom}
          onLeaveRoom={leaveDisasterRoom}
        />
      )}

      {/* Create Disaster Modal */}
      {isCreateModalOpen && (
        <CreateDisasterModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchDisasters();
          }}
        />
      )}
    </div>
  );
}
