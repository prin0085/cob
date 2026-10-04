import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const groups = [
  {
    label: 'Homepage',
    items: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/homepage', label: 'Homepage Content' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Products' },
    ],
  },
  {
    label: 'Media',
    items: [
      { to: '/admin/media', label: 'Image Library' },
      { to: '/admin/gallery', label: 'Gallery' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/navigation', label: 'Navigation' },
      { to: '/admin/contact', label: 'Contact' },
      { to: '/admin/social', label: 'Social Media' },
      { to: '/admin/age', label: 'Age Verification' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin">
      <div className="admin__shell">
        <aside className="admin__sidebar">
          <div className="admin__brand">
            COB<small>Content Manager</small>
          </div>
          <nav className="admin__nav">
            {groups.map((g) => (
              <div key={g.label} className="admin__nav-group">
                <div className="admin__nav-label">{g.label}</div>
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) => `admin__nav-link ${isActive ? 'is-active' : ''}`}
                  >
                    {it.label}
                  </NavLink>
                ))}
              </div>
            ))}
            {user?.role === 'ADMIN' && (
              <div className="admin__nav-group">
                <div className="admin__nav-label">Administration</div>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `admin__nav-link ${isActive ? 'is-active' : ''}`}
                >
                  Users
                </NavLink>
              </div>
            )}
          </nav>
          <div className="admin__user">
            <b>{user?.name}</b>
            <span>{user?.role}</span>
            <button className="admin__logout" onClick={doLogout}>
              Log out
            </button>
          </div>
        </aside>

        <main className="admin__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
