import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import Contacts from './pages/Contacts';
import Friendships from './pages/Friendships';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import './App.css';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check if onboarding completed
  const onboardingDone = localStorage.getItem('onboarding_completed');

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/onboarding"
        element={user ? <Navigate to="/dashboard" replace /> : <Onboarding />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected routes with navigation */}
      <Route
        path="/"
        element={
          !user && !onboardingDone ? (
            <Navigate to="/onboarding" replace />
          ) : !user ? (
            <Navigate to="/login" replace />
          ) : (
            <ProtectedRoute>
              <div className="app bg-background min-h-screen">
                <Navigation />
                <div className="lg:ml-64">
                  <Index />
                </div>
              </div>
            </ProtectedRoute>
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="app bg-background min-h-screen">
              <Navigation />
              <div className="lg:ml-64">
                <Dashboard />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <div className="app bg-background min-h-screen">
              <Navigation />
              <div className="lg:ml-64">
                <TodoList />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <div className="app bg-background min-h-screen">
              <Navigation />
              <div className="lg:ml-64">
                <Contacts />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/friendships"
        element={
          <ProtectedRoute>
            <div className="app bg-background min-h-screen">
              <Navigation />
              <div className="lg:ml-64">
                <Friendships />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="app bg-background min-h-screen">
              <Navigation />
              <div className="lg:ml-64">
                <Profile />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
