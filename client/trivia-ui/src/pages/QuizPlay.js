import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

function MediaBlock({ question }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    return () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
      if (audioEl) {
        audioEl.pause();
        audioEl.removeAttribute('src');
        audioEl.load();
      }
    };
  }, [question.id]);

  if (!question.mediaUrl) return null;

  const type = (question.mediaType || '').toLowerCase();
  const url = question.mediaUrl;

  if (type === 'video' || url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return (
      <div className="media-wrap">
        <video
          ref={videoRef}
          key={question.id}
          src={url}
          controls
          autoPlay
          playsInline
          className="media-video"
        >
          Your browser does not support video.
        </video>
      </div>
    );
  }

  if (type === 'audio' || url.match(/\.(mp3|wav|ogg)(\?|$)/i)) {
    return (
      <div className="media-wrap">
        <audio ref={audioRef} key={question.id} src={url} controls autoPlay className="media-audio">
          Your browser does not support audio.
        </audio>
      </div>
    );
  }

  if (type === 'animation' || type === 'image' || url.match(/\.(gif|png|jpg|jpeg|webp)(\?|$)/i)) {
    return (
      <div className="media-wrap">
        <img src={url} alt="" className="media-image" />
      </div>
    );
  }

  return (
    <div className="media-wrap">
      <img src={url} alt="" className="media-image" />
    </div>
  );
}

export default function QuizPlay() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setIndex(0);
    setFeedback('');
    (async () => {
      try {
        const data = await api(`/api/quizzes/${quizId}/play`);
        if (!cancelled) setQuiz(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const question = quiz?.questions?.[index];
  const total = quiz?.questions?.length ?? 0;
  const done = quiz && total > 0 && index >= total;

  async function handleChoice(slot) {
    if (!question || checking || done) return;
    setFeedback('');
    setChecking(true);
    try {
      const res = await api(`/api/quizzes/${quizId}/questions/${question.id}/answer`, {
        method: 'POST',
        body: { selectedSlot: slot },
      });
      if (res.correct) {
        setFeedback('Correct — nice work!');
        setTimeout(() => {
          setIndex((i) => i + 1);
          setFeedback('');
          setChecking(false);
        }, 600);
      } else {
        setFeedback('Not quite — try another answer.');
        setChecking(false);
      }
    } catch (e) {
      setFeedback(e.message);
      setChecking(false);
    }
  }

  if (loading) return <p className="center-msg">Loading quiz…</p>;
  if (error) {
    return (
      <div className="stack">
        <p className="error-banner">{error}</p>
        <Link to="/" className="btn btn-secondary">
          Back to categories
        </Link>
      </div>
    );
  }

  if (!quiz || total === 0) {
    return (
      <div className="stack">
        <p>This quiz has no questions yet.</p>
        <Link to="/" className="btn btn-secondary">
          Back to categories
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="quiz-done stack">
        <h2>You finished {quiz.title}</h2>
        <p>Great job completing all {total} questions.</p>
        <Link to="/" className="btn btn-primary btn-large">
          More categories
        </Link>
      </div>
    );
  }

  return (
    <div className="quiz-play">
      <div className="quiz-toolbar">
        <Link to="/" className="btn btn-secondary">
          ← Categories
        </Link>
        <span className="progress">
          Question {index + 1} of {total}
        </span>
      </div>
      <h2 className="quiz-title">{quiz.title}</h2>
      <div className="question-card stack">
        <MediaBlock question={question} />
        <p className="question-text">{question.text}</p>
        <div className="choices" role="group" aria-label="Answers">
          {question.choices.map((c) => (
            <button
              key={c.slot}
              type="button"
              className="btn btn-choice btn-large"
              onClick={() => handleChoice(c.slot)}
              disabled={checking}
            >
              {c.text}
            </button>
          ))}
        </div>
        {feedback && (
          <p className={feedback.startsWith('Correct') ? 'success-banner' : 'hint-banner'} role="status">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
