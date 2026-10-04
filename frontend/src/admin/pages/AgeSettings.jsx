import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Loading, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function AgeSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/settings').then((s) => setSettings(s || {})).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(
        '/settings',
        {
          age_gate_enabled: settings.age_gate_enabled === false || settings.age_gate_enabled === 'false' ? 'false' : 'true',
          min_age: String(settings.min_age || 20),
          age_gate_expiry_days: String(settings.age_gate_expiry_days || 30),
        },
        true
      );
      notify('Age verification settings saved');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!settings) return <Loading />;

  const enabled = settings.age_gate_enabled !== false && settings.age_gate_enabled !== 'false';

  return (
    <>
      <div className="admin__topbar">
        <h1>Age Verification</h1>
        <button className="abtn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
      <div className="apanel">
        <div className="field field--check">
          <input
            type="checkbox"
            id="agegate"
            checked={enabled}
            onChange={(e) => setSettings((s) => ({ ...s, age_gate_enabled: e.target.checked ? 'true' : 'false' }))}
          />
          <label htmlFor="agegate">Enable age verification modal</label>
        </div>
        <div className="field__row">
          <div className="field">
            <label>Minimum Age</label>
            <input type="number" value={settings.min_age || 20} onChange={(e) => setSettings((s) => ({ ...s, min_age: e.target.value }))} />
          </div>
          <div className="field">
            <label>Remember For (days)</label>
            <input type="number" value={settings.age_gate_expiry_days || 30} onChange={(e) => setSettings((s) => ({ ...s, age_gate_expiry_days: e.target.value }))} />
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(244,239,230,0.5)' }}>
          When enabled, visitors must confirm they meet the minimum age before entering. Their choice is stored in the browser for the number of days set above.
        </p>
      </div>
    </>
  );
}
