import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { Loading } from '../components/common/States.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Homepage from './pages/Homepage.jsx';
import GalleryManager from './pages/GalleryManager.jsx';
import MediaLibrary from './pages/MediaLibrary.jsx';
import Navigation from './pages/Navigation.jsx';
import ContactSettings from './pages/ContactSettings.jsx';
import SocialSettings from './pages/SocialSettings.jsx';
import AgeSettings from './pages/AgeSettings.jsx';
import Users from './pages/Users.jsx';
import '../admin/admin.css';

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="admin"><Loading label="Loading" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={
            <Protected>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="homepage" element={<Homepage />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="contact" element={<ContactSettings />} />
          <Route path="social" element={<SocialSettings />} />
          <Route path="age" element={<AgeSettings />} />
          <Route path="users" element={<Users />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
