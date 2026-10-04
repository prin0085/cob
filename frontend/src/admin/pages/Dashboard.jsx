import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Loading, ErrorState } from '../../components/common/States.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.get('/dashboard/stats', true).then(setStats).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <Loading />;

  const cards = [
    { label: 'Products', value: stats.products },
    { label: 'Published', value: stats.publishedProducts },
    { label: 'Images', value: stats.images },
    { label: 'Gallery Items', value: stats.gallery },
    { label: 'Content Sections', value: stats.sections },
    { label: 'Users', value: stats.users },
  ];

  return (
    <>
      <div className="admin__topbar">
        <h1>Dashboard</h1>
        <Link to="/admin/products/new" className="abtn">Add Product</Link>
      </div>

      <div className="stats">
        {cards.map((c) => (
          <div key={c.label} className="stat">
            <div className="stat__value">{c.value ?? 0}</div>
            <div className="stat__label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="apanel">
        <div className="apanel__title">Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/homepage" className="abtn abtn--ghost">Edit Homepage</Link>
          <Link to="/admin/products" className="abtn abtn--ghost">Manage Products</Link>
          <Link to="/admin/gallery" className="abtn abtn--ghost">Manage Gallery</Link>
          <Link to="/admin/media" className="abtn abtn--ghost">Image Library</Link>
        </div>
        {stats.lastUpdated && (
          <p style={{ marginTop: 18, fontSize: '0.82rem', color: 'rgba(244,239,230,0.5)' }}>
            Last updated: {stats.lastUpdated}
          </p>
        )}
      </div>
    </>
  );
}
