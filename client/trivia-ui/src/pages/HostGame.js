import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getCategories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function HostGame() {
  const { user } = useAuth();
  const connRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState('setup'); // setup, lobby, question, results, gameover
  const [question, setQuestion] = useState(null);
  const [answerCount, setAnswerCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    return () => { connRef.current?.stop(); };
  }, []);

  if (!user) return <Navigate to="/login" />;

  async function createGame() {
    if (!selectedCategory) return;
    setError('');

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/gamehub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('GameCreated', (code) => {
      setGameCode(code);
      setPhase('lobby');
    });
    connection.on('PlayerJoined', (name, playerList) => setPlayers(playerList));
    connection.on('PlayerLeft', (playerList) => setPlayers(playerList));
    connection.on('NewQuestion', (q) => { setQuestion(q); setPhase('question'); setAnswerCount(0); });
    connection.on('AnswerReceived', (count) => setAnswerCount(count));
    connection.on('QuestionResults', (correctIndex, lb) => { setLeaderboard(lb); setPhase('results'); });
    connection.on('GameOver', (lb) => { setLeaderboard(lb); setPhase('gameover'); });
    connection.on('Error', (msg) => setError(msg));

    try {
      await connection.start();
      connRef.current = connection;
      await connection.invoke('CreateGame', parseInt(selectedCategory));
    } catch { setError('Failed to connect to game server'); }
  }

  async function startGame() {
    await connRef.current?.invoke('StartGame', gameCode);
  }

  async function showResults() {
    await connRef.current?.invoke('ShowResults', gameCode);
  }

  async function nextQuestion() {
    await connRef.current?.invoke('NextQuestion', gameCode);
  }

  if (phase === 'setup') {
    return (
      <div style={styles.container}>
        <h2>Host a Game</h2>
        {error && <p style={styles.error}>{error}</p>}
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
          <option value="">Select a category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.questionCount} questions)</option>
          ))}
        </select>
        <button onClick={createGame} style={styles.btn} disabled={!selectedCategory}>Create Game</button>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <div style={styles.container}>
        <h2>Game Lobby</h2>
        <div style={styles.codeBox}>
          <p>Game Code:</p>
          <h1 style={styles.code}>{gameCode}</h1>
          <p>Share this code with players!</p>
        </div>
        <h3>Players ({players.length})</h3>
        <ul style={styles.playerList}>
          {players.map((p, i) => <li key={i} style={styles.player}>{p.name}</li>)}
        </ul>
        {players.length === 0 && <p style={{ color: '#95a5a6' }}>Waiting for players to join...</p>}
        <button onClick={startGame} style={styles.btn} disabled={players.length === 0}>
          Start Game
        </button>
      </div>
    );
  }

  if (phase === 'question') {
    return (
      <div style={styles.container}>
        <h3>Question {question.index + 1} of {question.total}</h3>
        <div style={styles.questionBox}>
          <h2>{question.text}</h2>
          <div style={styles.optionsGrid}>
            {question.options.map((opt, i) => (
              <div key={i} style={{ ...styles.option, backgroundColor: colors[i] }}>{opt}</div>
            ))}
          </div>
        </div>
        <p>{answerCount} / {players.length} answered</p>
        <button onClick={showResults} style={styles.btn}>Show Results</button>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div style={styles.container}>
        <h2>Results</h2>
        <div style={styles.leaderboard}>
          {leaderboard.map((p, i) => (
            <div key={i} style={{ ...styles.lbRow, backgroundColor: i === 0 ? '#f1c40f' : '#ecf0f1' }}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={styles.lbName}>{p.name}</span>
              <span style={styles.lbScore}>{p.score} pts</span>
            </div>
          ))}
        </div>
        <button onClick={nextQuestion} style={styles.btn}>Next Question</button>
      </div>
    );
  }

  // gameover
  return (
    <div style={styles.container}>
      <h2>Game Over!</h2>
      <div style={styles.leaderboard}>
        {leaderboard.map((p, i) => (
          <div key={i} style={{
            ...styles.lbRow,
            backgroundColor: i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#e67e22' : '#ecf0f1',
            fontSize: i === 0 ? '1.3rem' : '1rem',
          }}>
            <span style={styles.rank}>#{i + 1}</span>
            <span style={styles.lbName}>{p.name}</span>
            <span style={styles.lbScore}>{p.score} pts ({p.correctAnswers} correct)</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setPhase('setup'); setGameCode(''); setPlayers([]); connRef.current?.stop(); }}
        style={styles.btn}>New Game</button>
    </div>
  );
}

const colors = ['#e74c3c', '#3498db', '#f39c12', '#27ae60'];

const styles = {
  container: { padding: '30px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' },
  select: { padding: '10px', fontSize: '1rem', width: '100%', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  btn: { padding: '12px 30px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' },
  error: { color: '#e74c3c' },
  codeBox: { background: '#ecf0f1', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  code: { fontSize: '3rem', letterSpacing: '8px', color: '#2c3e50' },
  playerList: { listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
  player: { background: '#3498db', color: 'white', padding: '8px 16px', borderRadius: '20px' },
  questionBox: { background: '#2c3e50', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' },
  option: { padding: '16px', borderRadius: '8px', color: 'white', fontSize: '1.1rem', fontWeight: 'bold' },
  leaderboard: { marginBottom: '20px' },
  lbRow: { display: 'flex', alignItems: 'center', padding: '12px 16px', marginBottom: '6px', borderRadius: '8px' },
  rank: { fontWeight: 'bold', marginRight: '12px', width: '40px' },
  lbName: { flex: 1, textAlign: 'left' },
  lbScore: { fontWeight: 'bold' },
};
