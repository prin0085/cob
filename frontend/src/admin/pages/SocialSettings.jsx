import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function SocialSettings() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ platform: '', url: '', icon: '', status: 1 });
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/social', true).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const add = async () => {
    if (!draft.platform || !draft.url) return notify('Platform and URL required', 'error');
    await api.post('/social', draft, true);
    setDraft({ platform: '', url: '', icon: '', status: 1 });
    notify('Social link added');
    load();
  };

  const toggle = async (s) => {
    await api.put(`/social/${s.id}`, { status: s.status ? 0 : 1 }, true);
    load();
  };

  const remove = async (s) => {
    if (!confirm(`Remove ${s.platform}?`)) return;
    await api.del(`/social/${s.id}`, true);
    load();
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar"><h1>Social Media</h1></div>

      <div className="apanel">
        <div className="apanel__title">Add Social Link</div>
        <div className="field__row">
          <div className="field"><label>Platform</label><input value={draft.platform} onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value }))} /></div>
          <div className="field"><label>Icon (facebook/instagram/line)</label><input value={draft.icon} onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))} /></div>
        </div>
        <div className="field"><label>URL</label><input value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} /></div>
        <button className="abtn" onClick={add}>Add</button>
      </div>

      <div className="apanel">
        <div className="apanel__title">Social Links</div>
        {rows.length === 0 ? (
          <EmptyState message="No social links." />
        ) : (
          <div className="list-reorder">
            {rows.map((s) => (
              <div key={s.id} className="list-item">
                <div className="list-item__main"><b>{s.platform}</b><span>{s.url}</span></div>
                <button className={`badge ${s.status ? 'badge--on' : 'badge--off'}`} onClick={() => toggle(s)}>{s.status ? 'Visible' : 'Hidden'}</button>
                <button className="abtn abtn--danger abtn--sm" onClick={() => remove(s)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
