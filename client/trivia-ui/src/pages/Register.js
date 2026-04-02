import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const { register, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isAdmin) {
        await registerAdmin(email, password, displayName);
        navigate('/admin');
      } else {
        await register(email, password, displayName);
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.[0]?.description || 'Registration failed';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input type="text" placeholder="Display Name" value={displayName}
          onChange={(e) => setDisplayName(e.target.value)} required style={styles.input} />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password (min 6 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        <label style={styles.checkbox}>
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          Register as Admin
        </label>
        <button type="submit" style={styles.btn}>Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', paddingTop: '60px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
  btn: { padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px' },
  error: { color: '#e74c3c' },
};
