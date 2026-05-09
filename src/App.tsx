import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ComputerVisionDashboard from './pages/ComputerVisionDashboard';
import QueueFlowDashboard from './pages/QueueFlowDashboard';
import QueueAnalytics from './pages/QueueAnalytics';
import Profile from './pages/Profile';
import QueueDisplayBoard from './pages/QueueDisplayBoard';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/queue-display" element={<QueueDisplayBoard />} />
          <Route
            path="/computer-vision"
            element={
              <ProtectedRoute>
                <ComputerVisionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queueflow"
            element={
              <ProtectedRoute>
                <QueueFlowDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue-analytics"
            element={
              <ProtectedRoute>
                <QueueAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/computer-vision" replace />} />
          <Route path="*" element={<Navigate to="/computer-vision" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
