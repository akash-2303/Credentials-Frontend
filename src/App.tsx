import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* We removed the global Links from here because you usually 
          don't want "Login/Signup" links visible once you're inside the dashboard.
      */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Default Redirect: 
            If the user goes to the root "/", send them to login.
        */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes: Only accessible if authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<div style={{ padding: "20px" }}>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

