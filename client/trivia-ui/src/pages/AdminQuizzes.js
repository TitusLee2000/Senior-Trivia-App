import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const data = await api('/api/quizzes');
    setQuizzes(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/quizzes');
        if (!cancelled) setQuizzes(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/api/quizzes', {
        method: 'POST',
        body: { title: title.trim(), description: description.trim() },
      });
      setTitle('');
      setDescription('');
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this quiz and all of its questions?')) return;
    setError('');
    try {
      await api(`/api/quizzes/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-page">
      <h2 className="page-title">Admin — Quizzes</h2>
      <p className="page-subtitle">Create categories or open one to edit questions.</p>

      <form onSubmit={handleCreate} className="admin-form stack card-panel">
        <h3>New category</h3>
        <label className="field">
          <span>Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Add quiz
        </button>
      </form>

      <ul className="admin-list">
        {quizzes.map((q) => (
          <li key={q.id} className="admin-row card-panel">
            <div>
              <strong>{q.title}</strong>
              <div className="muted">{q.description}</div>
              <span className="meta">{q.questionCount} questions</span>
            </div>
            <div className="admin-actions">
              <Link to={`/admin/quiz/${q.id}`} className="btn btn-secondary">
                Edit questions
              </Link>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(q.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
