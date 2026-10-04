import { useEffect, useState } from 'react';
import { api, resolveImage } from '../../lib/api.js';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import { useToast } from '../components/Toast.jsx';

export default function GalleryManager() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ image: '', title: '', description: '', status: 1 });
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/gallery', true).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const add = async () => {
    if (!draft.image) return notify('Please add an image first', 'error');
    try {
      await api.post('/gallery', draft, true);
      setDraft({ image: '', title: '', description: '', status: 1 });
      notify('Added to gallery');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const toggle = async (g) => {
    await api.put(`/gallery/${g.id}`, { status: g.status ? 0 : 1 }, true);
    load();
  };

  const move = async (index, dir) => {
    const next = [...rows];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    await api.put('/gallery/reorder/bulk', { items: next.map((r, i) => ({ id: r.id, sort_order: i })) }, true);
  };

  const remove = async (g) => {
    if (!confirm('Remove this gallery image?')) return;
    await api.del(`/gallery/${g.id}`, true);
    notify('Removed');
    load();
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar"><h1>Gallery</h1></div>

      <div className="apanel">
        <div className="apanel__title">Add Image</div>
        <ImagePicker label="Image" value={draft.image} onChange={(v) => setDraft((d) => ({ ...d, image: v }))} placement="gallery" />
        <div className="field__row">
          <div className="field"><label>Title</label><input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} /></div>
          <div className="field"><label>Description</label><input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /></div>
        </div>
        <button className="abtn" onClick={add}>Add to Gallery</button>
      </div>

      <div className="apanel">
        <div className="apanel__title">Gallery Images ({rows.length})</div>
        {rows.length === 0 ? (
          <EmptyState message="No gallery images yet." />
        ) : (
          <div className="list-reorder">
            {rows.map((g, i) => (
              <div key={g.id} className="list-item">
                <img className="atable" src={resolveImage(g.image)} alt="" style={{ width: 54, height: 54, objectFit: 'cover' }} />
                <div className="list-item__main">
                  <b>{g.title || 'Untitled'}</b>
                  <span>{g.description}</span>
                </div>
                <button className={`badge ${g.status ? 'badge--on' : 'badge--off'}`} onClick={() => toggle(g)}>
                  {g.status ? 'Visible' : 'Hidden'}
                </button>
                <button className="abtn abtn--ghost abtn--sm" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button className="abtn abtn--ghost abtn--sm" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button className="abtn abtn--danger abtn--sm" onClick={() => remove(g)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
