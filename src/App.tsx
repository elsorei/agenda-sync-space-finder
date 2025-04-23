
// Mantieni l'import esistente
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import Users from './pages/Users';
import Blackboard from './pages/Blackboard';
import NotFound from './pages/NotFound';
import './App.css';
import { Toaster } from './components/ui/toaster';
import AnimatedCursor from './components/animated-cursor/AnimatedCursor';

function App() {
  return (
    <Router>
      <div className="app bg-background min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/users" element={<Users />} />
          <Route path="/blackboard" element={<Blackboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <AnimatedCursor />
      </div>
    </Router>
  );
}

export default App;
