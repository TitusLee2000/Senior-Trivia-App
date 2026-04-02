import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1>Senior Trivia</h1>
      <p style={styles.subtitle}>A Kahoot-style multiplayer trivia game for seniors!</p>

      {user ? (
        <div style={styles.actions}>
          <Link to="/host" style={{ ...styles.card, backgroundColor: '#3498db' }}>
            <h3>Host a Game</h3>
            <p>Create a game room and invite players</p>
          </Link>
          <Link to="/play" style={{ ...styles.card, backgroundColor: '#27ae60' }}>
            <h3>Join a Game</h3>
            <p>Enter a game code to join</p>
          </Link>
          {user.role === 'Admin' && (
            <Link to="/admin" style={{ ...styles.card, backgroundColor: '#8e44ad' }}>
              <h3>Admin Panel</h3>
              <p>Manage categories and questions</p>
            </Link>
          )}
        </div>
      ) : (
        <div style={styles.actions}>
          <Link to="/login" style={{ ...styles.card, backgroundColor: '#3498db' }}>
            <h3>Login</h3>
            <p>Sign in to play or host</p>
          </Link>
          <Link to="/register" style={{ ...styles.card, backgroundColor: '#27ae60' }}>
            <h3>Register</h3>
            <p>Create a new account</p>
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: 'center', padding: '40px 20px' },
  subtitle: { color: '#7f8c8d', fontSize: '1.2rem', marginBottom: '40px' },
  actions: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' },
  card: {
    display: 'block', color: 'white', textDecoration: 'none',
    padding: '30px', borderRadius: '12px', width: '220px',
    transition: 'transform 0.2s',
  },
};
