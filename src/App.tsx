import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { BeachDetailPage } from './pages/BeachDetailPage';
import { TopNav, Sidebar } from './components/Navigation';
import { useAuthStore } from './store';

const queryClient = new QueryClient();

export default function App() {
  const { user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-on-background font-body">
          <TopNav />
          <Sidebar />
          <main className="transition-all duration-300">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/beach/:id" element={<BeachDetailPage />} />
              <Route path="/analytics" element={<Navigate to="/map" />} />
              <Route path="/alerts" element={<div className="pt-24 px-8">Alerts Management (Coming Soon)</div>} />
              <Route path="/admin" element={<div className="pt-24 px-8">Admin Dashboard (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
