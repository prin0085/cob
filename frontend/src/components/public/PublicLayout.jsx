import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AgeGate from './AgeGate.jsx';

export default function PublicLayout() {
  const { pathname, hash } = useLocation();

  // Scroll to top on route change (but honour in-page hash anchors).
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return (
    <>
      <AgeGate />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
