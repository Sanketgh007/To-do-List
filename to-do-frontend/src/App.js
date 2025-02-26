import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Todo from './components/Todo';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/todos" 
          element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/todos" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
