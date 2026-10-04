import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Navigation() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ label: '', url: '', status: 1 });
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/menus', true).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const add = async () => {
    if (!draft.label || !draft.url) return notify('Label and URL required', 'error');
    await api.post('/menus', draft, true);
    setDraft({ label: '', url: '', status: 1 });
    notify('Menu item added');
    load();
  };

  const toggle = async (m) => {
    await api.put(`/menus/${m.id}`, { status: m.status ? 0 : 1 }, true);
    load();
  };

  const move = async (index, dir) => {
    const next = [...rows];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    setRows(next);
    await api.put('/menus/reorder/bulk', { items: next.map((r, i) => ({ id: r.id, sort_order: i })) }, true);
  };

  const remove = async (m) => {
    if (!confirm(`Remove "${m.label}"?`)) return;
    await api.del(`/menus/${m.id}`, true);
    load();
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar"><h1>Navigation</h1></div>

      <div className="apanel">
        <div className="apanel__title">Add Menu Item</div>
        <div className="field__row">
          <div className="field"><label>Label</label><input value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} /></div>
          <div className="field"><label>URL (e.g. /#story)</label><input value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} /></div>
        </div>
        <button className="abtn" onClick={add}>Add</button>
      </div>

      <div className="apanel">
        <div className="apanel__title">Menu Items</div>
        {rows.length === 0 ? (
          <EmptyState message="No menu items." />
        ) : (
          <div className="list-reorder">
            {rows.map((m, i) => (
              <div key={m.id} className="list-item">
                <div className="list-item__main"><b>{m.label}</b><span>{m.url}</span></div>
                <button className={`badge ${m.status ? 'badge--on' : 'badge--off'}`} onClick={() => toggle(m)}>{m.status ? 'Visible' : 'Hidden'}</button>
                <button className="abtn abtn--ghost abtn--sm" onClick={() => move(i, -1)}>↑</button>
                <button className="abtn abtn--ghost abtn--sm" onClick={() => move(i, 1)}>↓</button>
                <button className="abtn abtn--danger abtn--sm" onClick={() => remove(m)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
