import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Senior Trivia</Link>
      <div style={styles.links}>
        {user ? (
          <>
            {user.role === 'Admin' && (
              <Link to="/admin" style={styles.link}>Admin Panel</Link>
            )}
            <Link to="/play" style={styles.link}>Play</Link>
            <Link to="/host" style={styles.link}>Host Game</Link>
            <span style={styles.email}>{user.email} ({user.role})</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', backgroundColor: '#2c3e50', color: '#ecf0f1',
  },
  brand: {
    color: '#ecf0f1', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 'bold',
  },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#ecf0f1', textDecoration: 'none' },
  email: { color: '#bdc3c7', fontSize: '0.85rem' },
  btn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '6px 14px', borderRadius: '4px', cursor: 'pointer',
  },
};
