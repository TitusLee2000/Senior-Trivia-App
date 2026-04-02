import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

const emptyForm = {
  text: '',
  mediaUrl: '',
  mediaType: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correctAnswerIndex: 0,
};

export default function AdminQuizDetail() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api(`/api/quizzes/${quizId}`);
    setQuiz(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/quizzes/${quizId}`);
        if (!cancelled) setQuiz(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: {
          text: form.text.trim(),
          mediaUrl: form.mediaUrl.trim() || null,
          mediaType: form.mediaType.trim() || null,
          option1: form.option1.trim() || null,
          option2: form.option2.trim() || null,
          option3: form.option3.trim() || null,
          option4: form.option4.trim() || null,
          correctAnswerIndex: Number(form.correctAnswerIndex),
        },
      });
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm('Delete this question?')) return;
    setError('');
    try {
      await api(`/api/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!quiz && !error) return <p className="center-msg">Loading…</p>;
  if (error && !quiz) {
    return (
      <div className="stack">
        <p className="error-banner">{error}</p>
        <Link to="/admin" className="btn btn-secondary">
          Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="quiz-toolbar">
        <Link to="/admin" className="btn btn-secondary">
          ← All quizzes
        </Link>
      </div>
      <h2 className="page-title">{quiz.title}</h2>
      <p className="page-subtitle">{quiz.description}</p>

      <form onSubmit={handleAddQuestion} className="admin-form stack card-panel">
        <h3>Add question</h3>
        <p className="hint">
          Use option slots 1–4. Correct answer index is 0–3 matching option 1–4. At least two options required.
        </p>
        <label className="field">
          <span>Question text</span>
          <textarea
            className="input"
            rows={2}
            value={form.text}
            onChange={(e) => updateField('text', e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Media URL (optional)</span>
          <input className="input" value={form.mediaUrl} onChange={(e) => updateField('mediaUrl', e.target.value)} />
        </label>
        <label className="field">
          <span>Media type (optional)</span>
          <input
            className="input"
            placeholder="image, video, audio, animation"
            value={form.mediaType}
            onChange={(e) => updateField('mediaType', e.target.value)}
          />
        </label>
        {['option1', 'option2', 'option3', 'option4'].map((k, i) => (
          <label key={k} className="field">
            <span>Option {i + 1}</span>
            <input className="input" value={form[k]} onChange={(e) => updateField(k, e.target.value)} />
          </label>
        ))}
        <label className="field">
          <span>Correct answer (slot 0–3)</span>
          <select
            className="input"
            value={form.correctAnswerIndex}
            onChange={(e) => updateField('correctAnswerIndex', e.target.value)}
          >
            <option value={0}>0 — Option 1</option>
            <option value={1}>1 — Option 2</option>
            <option value={2}>2 — Option 3</option>
            <option value={3}>3 — Option 4</option>
          </select>
        </label>
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Save question
        </button>
      </form>

      <h3 className="section-heading">Existing questions</h3>
      <ul className="admin-list">
        {(quiz.questions || []).map((q) => (
          <li key={q.id} className="card-panel">
            <p>{q.text}</p>
            <ul className="compact-list">
              {[q.option1, q.option2, q.option3, q.option4].map(
                (o, i) =>
                  o && (
                    <li key={i}>
                      {i}: {o}
                      {q.correctAnswerIndex === i ? ' ✓' : ''}
                    </li>
                  )
              )}
            </ul>
            <button type="button" className="btn btn-danger" onClick={() => handleDeleteQuestion(q.id)}>
              Delete question
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
