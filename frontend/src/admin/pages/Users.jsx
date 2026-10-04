import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading, ErrorState, EmptyState } from '../../components/common/States.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Users() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: 'EDITOR' });
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/users', true).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const add = async () => {
    if (!draft.name || !draft.email || !draft.password) return notify('All fields required', 'error');
    try {
      await api.post('/users', draft, true);
      setDraft({ name: '', email: '', password: '', role: 'EDITOR' });
      notify('User created');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try {
      await api.del(`/users/${u.id}`, true);
      notify('User deleted');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (user?.role !== 'ADMIN') return <ErrorState message="Only administrators can manage users." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="admin__topbar"><h1>Users</h1></div>

      <div className="apanel">
        <div className="apanel__title">Add User</div>
        <div className="field__row">
          <div className="field"><label>Name</label><input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></div>
          <div className="field"><label>Email</label><input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} /></div>
        </div>
        <div className="field__row">
          <div className="field"><label>Password</label><input type="password" value={draft.password} onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))} /></div>
          <div className="field">
            <label>Role</label>
            <select value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}>
              <option value="EDITOR">Editor (content & products)</option>
              <option value="ADMIN">Admin (full access)</option>
            </select>
          </div>
        </div>
        <button className="abtn" onClick={add}>Create User</button>
      </div>

      <div className="apanel">
        <div className="apanel__title">All Users</div>
        {rows.length === 0 ? (
          <EmptyState message="No users." />
        ) : (
          <table className="atable">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'ADMIN' ? 'badge--gold' : 'badge--off'}`}>{u.role}</span></td>
                  <td>
                    <div className="atable__actions">
                      {u.id !== user.id ? (
                        <button className="abtn abtn--danger abtn--sm" onClick={() => remove(u)}>Delete</button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(244,239,230,0.4)' }}>You</span>
                      )}
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
