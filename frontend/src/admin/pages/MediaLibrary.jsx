import { useEffect, useRef, useState } from 'react';
import { api, resolveImage } from '../../lib/api.js';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function MediaLibrary() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/upload', true).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.upload(file, { placement: 'library' });
      notify('Image uploaded & optimized');
      load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const copy = (url) => {
    navigator.clipboard?.writeText(resolveImage(url));
    notify('URL copied');
  };

  const remove = async (img) => {
    if (!confirm('Delete this image? Any section using it will lose it.')) return;
    await api.del(`/upload/${img.id}`, true);
    notify('Deleted');
    load();
  };

  const kb = (b) => (b ? `${Math.round(b / 1024)} KB` : '—');

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar">
        <h1>Image Library</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
          <button className="abtn" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload Image'}
          </button>
        </div>
      </div>

      <div className="apanel">
        {rows.length === 0 ? (
          <EmptyState message="No images uploaded yet." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {rows.map((img) => (
              <div key={img.id} style={{ border: '1px solid var(--line-inverse)', borderRadius: 2, overflow: 'hidden', background: '#0f0d0b' }}>
                <img src={resolveImage(img.url)} alt={img.alt || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 10, fontSize: '0.72rem' }}>
                  <div style={{ color: 'rgba(244,239,230,0.5)' }}>{img.width}×{img.height} · {kb(img.size_bytes)}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="abtn abtn--ghost abtn--sm" onClick={() => copy(img.url)}>Copy</button>
                    <button className="abtn abtn--danger abtn--sm" onClick={() => remove(img)}>Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
