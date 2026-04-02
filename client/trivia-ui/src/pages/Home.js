import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/quizzes');
        if (!cancelled) setQuizzes(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="center-msg">Loading categories…</p>;
  if (error) return <p className="error-banner">{error}</p>;

  return (
    <div className="home">
      <h2 className="page-title">Choose a category</h2>
      <p className="page-subtitle">Pick a topic to start your quiz.</p>
      <div className="category-grid">
        {quizzes.map((q) => (
          <Link key={q.id} to={`/quiz/${q.id}`} className="category-card">
            <h3>{q.title}</h3>
            <p>{q.description}</p>
            <span className="meta">{q.questionCount} questions</span>
          </Link>
        ))}
      </div>
      {quizzes.length === 0 && <p className="center-msg">No quizzes yet. Ask an admin to add some.</p>}
    </div>
  );
}
