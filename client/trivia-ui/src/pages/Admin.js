import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, createCategory, deleteCategory, getQuestions, createQuestion, deleteQuestion } from '../services/api';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [qForm, setQForm] = useState({
    text: '', option1: '', option2: '', option3: '', option4: '',
    correctAnswerIndex: 0, mediaUrl: '', mediaType: '',
  });
  const [error, setError] = useState('');

  useEffect(() => { loadCategories(); }, []);

  if (!user || user.role !== 'Admin') return <Navigate to="/" />;

  async function loadCategories() {
    const res = await getCategories();
    setCategories(res.data);
  }

  async function loadQuestions(catId) {
    setSelectedCategory(catId);
    const res = await getQuestions(catId);
    setQuestions(res.data);
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    setError('');
    try {
      await createCategory(catForm);
      setCatForm({ name: '', description: '' });
      loadCategories();
    } catch { setError('Failed to create category'); }
  }

  async function handleDeleteCategory(id) {
    await deleteCategory(id);
    if (selectedCategory === id) { setSelectedCategory(null); setQuestions([]); }
    loadCategories();
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setError('');
    try {
      await createQuestion({ ...qForm, categoryId: selectedCategory });
      setQForm({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, mediaUrl: '', mediaType: '' });
      loadQuestions(selectedCategory);
    } catch { setError('Failed to create question'); }
  }

  async function handleDeleteQuestion(id) {
    await deleteQuestion(id);
    loadQuestions(selectedCategory);
  }

  return (
    <div style={styles.container}>
      <h2>Admin Panel</h2>
      {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

      <div style={styles.grid}>
        {/* Categories */}
        <div style={styles.panel}>
          <h3>Categories</h3>
          <form onSubmit={handleAddCategory} style={styles.form}>
            <input placeholder="Category Name" value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required style={styles.input} />
            <input placeholder="Description" value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} required style={styles.input} />
            <button type="submit" style={styles.addBtn}>Add Category</button>
          </form>
          <ul style={styles.list}>
            {categories.map((c) => (
              <li key={c.id} style={{
                ...styles.listItem,
                backgroundColor: selectedCategory === c.id ? '#3498db' : '#ecf0f1',
                color: selectedCategory === c.id ? 'white' : '#2c3e50',
              }}>
                <span onClick={() => loadQuestions(c.id)} style={{ cursor: 'pointer', flex: 1 }}>
                  {c.name} ({c.questionCount} Q's)
                </span>
                <button onClick={() => handleDeleteCategory(c.id)} style={styles.delBtn}>X</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions */}
        <div style={styles.panel}>
          <h3>Questions {selectedCategory ? `(Category #${selectedCategory})` : ''}</h3>
          {selectedCategory && (
            <>
              <form onSubmit={handleAddQuestion} style={styles.form}>
                <input placeholder="Question text" value={qForm.text}
                  onChange={(e) => setQForm({ ...qForm, text: e.target.value })} required style={styles.input} />
                <input placeholder="Option 1" value={qForm.option1}
                  onChange={(e) => setQForm({ ...qForm, option1: e.target.value })} required style={styles.input} />
                <input placeholder="Option 2" value={qForm.option2}
                  onChange={(e) => setQForm({ ...qForm, option2: e.target.value })} required style={styles.input} />
                <input placeholder="Option 3" value={qForm.option3}
                  onChange={(e) => setQForm({ ...qForm, option3: e.target.value })} required style={styles.input} />
                <input placeholder="Option 4" value={qForm.option4}
                  onChange={(e) => setQForm({ ...qForm, option4: e.target.value })} required style={styles.input} />
                <select value={qForm.correctAnswerIndex}
                  onChange={(e) => setQForm({ ...qForm, correctAnswerIndex: parseInt(e.target.value) })} style={styles.input}>
                  <option value={0}>Correct: Option 1</option>
                  <option value={1}>Correct: Option 2</option>
                  <option value={2}>Correct: Option 3</option>
                  <option value={3}>Correct: Option 4</option>
                </select>
                <button type="submit" style={styles.addBtn}>Add Question</button>
              </form>
              <ul style={styles.list}>
                {questions.map((q) => (
                  <li key={q.id} style={styles.listItem}>
                    <div style={{ flex: 1 }}>
                      <strong>{q.text}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => (
                          <span key={i} style={{
                            marginRight: '8px',
                            fontWeight: i === q.correctAnswerIndex ? 'bold' : 'normal',
                            color: i === q.correctAnswerIndex ? '#27ae60' : '#7f8c8d',
                          }}>{opt}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={styles.delBtn}>X</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!selectedCategory && <p style={{ color: '#95a5a6' }}>Select a category to manage questions</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1100px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' },
  panel: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' },
  addBtn: { padding: '8px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  delBtn: { background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { display: 'flex', alignItems: 'center', padding: '10px', marginBottom: '6px', borderRadius: '4px', backgroundColor: '#ecf0f1' },
};
