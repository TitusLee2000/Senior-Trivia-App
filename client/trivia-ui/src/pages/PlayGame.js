import { useState, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PlayGame() {
  const connRef = useRef(null);
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [phase, setPhase] = useState('join'); // join, lobby, question, waiting, results, gameover
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  async function joinGame(e) {
    e.preventDefault();
    setError('');

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/gamehub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('PlayerJoined', (name, playerList) => setPlayers(playerList));
    connection.on('PlayerLeft', (playerList) => setPlayers(playerList));
    connection.on('GameStarted', () => setPhase('question'));
    connection.on('NewQuestion', (q) => {
      setQuestion(q);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setPhase('question');
    });
    connection.on('QuestionResults', (correctIdx, lb) => {
      setCorrectAnswer(correctIdx);
      setLeaderboard(lb);
      setPhase('results');
    });
    connection.on('GameOver', (lb) => {
      setLeaderboard(lb);
      setPhase('gameover');
    });
    connection.on('Error', (msg) => setError(msg));

    try {
      await connection.start();
      connRef.current = connection;
      await connection.invoke('JoinGame', gameCode, playerName);
      setPhase('lobby');
    } catch {
      setError('Failed to connect to game server');
    }
  }

  async function submitAnswer(index) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setPhase('waiting');
    await connRef.current?.invoke('SubmitAnswer', gameCode, index);
  }

  if (phase === 'join') {
    return (
      <div style={styles.container}>
        <h2>Join a Game</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={joinGame} style={styles.form}>
          <input placeholder="Your Name" value={playerName}
            onChange={(e) => setPlayerName(e.target.value)} required style={styles.input} />
          <input placeholder="Game Code" value={gameCode}
            onChange={(e) => setGameCode(e.target.value)} required style={styles.input}
            maxLength={6} />
          <button type="submit" style={styles.btn}>Join Game</button>
        </form>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <div style={styles.container}>
        <h2>Waiting for host to start...</h2>
        <div style={styles.codeBox}>
          <p>Game Code: <strong>{gameCode}</strong></p>
        </div>
        <h3>Players ({players.length})</h3>
        <ul style={styles.playerList}>
          {players.map((p, i) => (
            <li key={i} style={{
              ...styles.player,
              backgroundColor: p.name === playerName ? '#27ae60' : '#3498db'
            }}>{p.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (phase === 'question' || phase === 'waiting') {
    return (
      <div style={styles.container}>
        <h3>Question {question.index + 1} of {question.total}</h3>
        <h2 style={styles.questionText}>{question.text}</h2>
        <div style={styles.optionsGrid}>
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => submitAnswer(i)}
              disabled={selectedAnswer !== null}
              style={{
                ...styles.optionBtn,
                backgroundColor: selectedAnswer === i ? '#2c3e50' : colors[i],
                opacity: selectedAnswer !== null && selectedAnswer !== i ? 0.5 : 1,
              }}>
              {opt}
            </button>
          ))}
        </div>
        {phase === 'waiting' && <p style={{ marginTop: '20px', color: '#95a5a6' }}>Answer submitted! Waiting for others...</p>}
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div style={styles.container}>
        <h2>{selectedAnswer === correctAnswer ? 'Correct!' : 'Wrong!'}</h2>
        <p style={{ color: selectedAnswer === correctAnswer ? '#27ae60' : '#e74c3c', fontSize: '1.2rem' }}>
          The answer was: {question.options[correctAnswer]}
        </p>
        <h3>Leaderboard</h3>
        <div style={styles.leaderboard}>
          {leaderboard.map((p, i) => (
            <div key={i} style={{
              ...styles.lbRow,
              backgroundColor: p.name === playerName ? '#3498db' : i === 0 ? '#f1c40f' : '#ecf0f1',
              color: p.name === playerName ? 'white' : '#2c3e50',
            }}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
              <span style={{ fontWeight: 'bold' }}>{p.score} pts</span>
            </div>
          ))}
        </div>
        <p style={{ color: '#95a5a6' }}>Waiting for host...</p>
      </div>
    );
  }

  // gameover
  const myRank = leaderboard.findIndex((p) => p.name === playerName) + 1;
  return (
    <div style={styles.container}>
      <h2>Game Over!</h2>
      <h3>You finished #{myRank}!</h3>
      <div style={styles.leaderboard}>
        {leaderboard.map((p, i) => (
          <div key={i} style={{
            ...styles.lbRow,
            backgroundColor: p.name === playerName ? '#3498db' : i === 0 ? '#f1c40f' : '#ecf0f1',
            color: p.name === playerName ? 'white' : '#2c3e50',
            fontSize: i === 0 ? '1.3rem' : '1rem',
          }}>
            <span style={styles.rank}>#{i + 1}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
            <span style={{ fontWeight: 'bold' }}>{p.score} pts ({p.correctAnswers} correct)</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setPhase('join'); setGameCode(''); connRef.current?.stop(); }}
        style={styles.btn}>Play Again</button>
    </div>
  );
}

const colors = ['#e74c3c', '#3498db', '#f39c12', '#27ae60'];

const styles = {
  container: { padding: '30px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.1rem', textAlign: 'center' },
  btn: { padding: '12px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' },
  error: { color: '#e74c3c' },
  codeBox: { background: '#ecf0f1', padding: '16px', borderRadius: '8px', marginBottom: '20px' },
  playerList: { listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
  player: { color: 'white', padding: '8px 16px', borderRadius: '20px' },
  questionText: { marginBottom: '24px' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  optionBtn: { padding: '20px', borderRadius: '10px', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  leaderboard: { marginBottom: '20px' },
  lbRow: { display: 'flex', alignItems: 'center', padding: '12px 16px', marginBottom: '6px', borderRadius: '8px' },
  rank: { fontWeight: 'bold', marginRight: '12px', width: '40px' },
};
