import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, resolveImage } from '../../lib/api.js';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Products() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const notify = useToast();
  const navigate = useNavigate();

  const load = useCallback(() => {
    setError(null);
    api.get('/products?all=1', true).then(setRows).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const toggle = async (p, key) => {
    try {
      await api.put(`/products/${p.id}`, { [key]: p[key] ? 0 : 1 }, true);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/products/${p.id}`, true);
      notify('Product deleted');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="abtn">Add Product</Link>
      </div>

      <div className="apanel">
        {rows.length === 0 ? (
          <EmptyState message="No products yet. Add your first one." />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.main_image ? <img src={resolveImage(p.main_image)} alt="" /> : null}
                  </td>
                  <td><b>{p.name}</b></td>
                  <td>{p.category || '—'}</td>
                  <td>
                    <button className={`badge ${p.status ? 'badge--on' : 'badge--off'}`} onClick={() => toggle(p, 'status')}>
                      {p.status ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <button className={`badge ${p.featured ? 'badge--gold' : 'badge--off'}`} onClick={() => toggle(p, 'featured')}>
                      {p.featured ? 'Featured' : 'No'}
                    </button>
                  </td>
                  <td>
                    <div className="atable__actions">
                      <button className="abtn abtn--ghost abtn--sm" onClick={() => navigate(`/admin/products/${p.id}`)}>Edit</button>
                      <button className="abtn abtn--danger abtn--sm" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
