import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext.jsx';
import PublicLayout from './components/public/PublicLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import { Loading } from './components/common/States.jsx';

// Admin bundle is code-split so the public site stays lightweight.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <SiteProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="product/:slug" element={<ProductPage />} />
              </Route>
            </Routes>
          </SiteProvider>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loading label="Loading admin" />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
