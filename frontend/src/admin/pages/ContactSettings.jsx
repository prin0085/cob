import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Loading, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

const FIELDS = [
  ['brand_name', 'Brand Name'],
  ['brand_tagline', 'Tagline'],
  ['brand_description', 'Brand Description', 'textarea'],
  ['contact_address', 'Address'],
  ['contact_phone', 'Phone'],
  ['contact_email', 'Email'],
  ['contact_maps_url', 'Google Maps URL'],
  ['footer_copyright', 'Footer Copyright'],
];

export default function ContactSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/settings').then((s) => setSettings(s || {})).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const set = (key) => (e) => setSettings((s) => ({ ...s, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(FIELDS.map(([k]) => [k, settings[k] ?? '']));
      await api.put('/settings', payload, true);
      notify('Contact & brand settings saved');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!settings) return <Loading />;

  return (
    <>
      <div className="admin__topbar">
        <h1>Contact &amp; Brand</h1>
        <button className="abtn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
      <div className="apanel">
        {FIELDS.map(([key, label, type]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            {type === 'textarea' ? (
              <textarea value={settings[key] || ''} onChange={set(key)} />
            ) : (
              <input value={settings[key] || ''} onChange={set(key)} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
