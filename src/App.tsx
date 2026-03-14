import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LandingPage from './LandingPage';
import Login from './Login';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminGallery from './AdminGallery';
import AdminClients from './AdminClients';
import AdminServices from './AdminServices';
import AdminFinance from './AdminFinance';
import AdminSettings from './AdminSettings';
import AdminPageManager from './AdminPageManager';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index             element={<AdminDashboard />} />
            <Route path="finance"    element={<AdminFinance />} />
            <Route path="gallery"    element={<AdminGallery />} />
            <Route path="clients"    element={<AdminClients />} />
            <Route path="services"   element={<AdminServices />} />
            <Route path="page"       element={<AdminPageManager />} />
            <Route path="settings"   element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
