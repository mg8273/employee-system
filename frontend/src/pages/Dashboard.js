import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEmployees = async () => {
    const { data } = await API.get('/employees');
    setEmployees(data);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()), performanceScore: Number(form.performanceScore), experience: Number(form.experience) };
      if (editId) {
        await API.put(`/employees/${editId}`, payload);
        setMsg('Employee updated!');
        setEditId(null);
      } else {
        await API.post('/employees', payload);
        setMsg('Employee added!');
      }
      setForm({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' });
      fetchEmployees();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await API.delete(`/employees/${id}`);
    fetchEmployees();
  };

  const handleEdit = (emp) => {
    setEditId(emp._id);
    setForm({ name: emp.name, email: emp.email, department: emp.department, skills: emp.skills.join(', '), performanceScore: emp.performanceScore, experience: emp.experience });
  };

  const handleSearch = async () => {
    if (!search.trim()) { fetchEmployees(); return; }
    const { data } = await API.get(`/employees/search?department=${search}`);
    setEmployees(data);
  };

  const handleAI = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const { data } = await API.post('/ai/recommend');
      setAiResult(data.recommendation);
    } catch (err) {
      setAiResult('AI Error: ' + (err.response?.data?.message || err.message));
    }
    setAiLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <span>👔 Employee Analytics — Welcome, {user?.name}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
      <div className="content">

        <div className="card">
          <h3>{editId ? '✏️ Edit Employee' : '➕ Add Employee'}</h3>
          {msg && <p className="msg">{msg}</p>}
          <form onSubmit={handleSubmit} className="item-form">
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required />
            <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
            <input name="performanceScore" type="number" placeholder="Performance Score (0-100)" value={form.performanceScore} onChange={handleChange} required />
            <input name="experience" type="number" placeholder="Years of Experience" value={form.experience} onChange={handleChange} required />
            <button type="submit">{editId ? 'Update' : 'Add Employee'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' }); }}>Cancel</button>}
          </form>
        </div>

        <div className="card">
          <h3>🔎 Search by Department</h3>
          <div className="search-row">
            <input placeholder="Enter department..." value={search} onChange={e => setSearch(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
            <button onClick={() => { setSearch(''); fetchEmployees(); }}>Clear</button>
          </div>
        </div>

        <div className="card">
          <h3>🤖 AI Recommendations</h3>
          <button onClick={handleAI} className="ai-btn" disabled={aiLoading}>
            {aiLoading ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
          {aiResult && <div className="ai-result"><pre>{aiResult}</pre></div>}
        </div>

        <div className="card">
          <h3>📋 All Employees ({employees.length})</h3>
          {employees.length === 0 ? <p>No employees found.</p> :
            <div className="items-grid">
              {employees.map(emp => (
                <div key={emp._id} className={`item-card ${getScoreColor(emp.performanceScore)}`}>
                  <div className="item-badge">Score: {emp.performanceScore}</div>
                  <h4>{emp.name}</h4>
                  <p>📧 {emp.email}</p>
                  <p>🏢 {emp.department}</p>
                  <p>💼 {emp.experience} years exp</p>
                  <p>🛠 {emp.skills.join(', ')}</p>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="del-btn" onClick={() => handleDelete(emp._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

      </div>
    </div>
  );
}
