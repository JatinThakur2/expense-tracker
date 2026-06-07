import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { BarChartCard, PieChartCard } from '../components/Charts';
import ExpenseForm from '../components/ExpenseForm';
import { categoryMeta } from '../utils/categories';

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchStats = useCallback(() => {
    api.get('/expenses/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleAdd = async (data) => {
    await api.post('/expenses', data);
    setShowForm(false);
    fetchStats();
  };

  if (loading) return <div className="loading-full"><div className="spinner" style={{ width: 28, height: 28 }} /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your spending overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add expense
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        <StatCard label="Total Spent" value={fmt(stats.total)} icon="💸" color="#4f46e5" bg="var(--primary-soft)" sub="All time" />
        <StatCard label="This Month" value={fmt(stats.monthly)} icon="📅" color="#059669" bg="var(--success-soft)" sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} />
        <StatCard label="Categories" value={stats.byCategory.length} icon="🗂" color="#d97706" bg="var(--warning-soft)" sub="Unique categories" />
        <StatCard label="Total Entries" value={stats.count} icon="📋" color="#0891b2" bg="#e0f2fe" sub="See all expenses" link="/expenses" />
      </div>

      <div className="charts-grid" style={{ marginBottom: '1.25rem' }}>
        <BarChartCard data={stats.monthlyTrend} />
        <PieChartCard data={stats.byCategory} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <Link to="/expenses" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        <div className="card-body" style={{ paddingTop: '0.25rem', paddingBottom: '0.5rem' }}>
          {stats.recent.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>No expenses yet</h3>
              <p>Add your first expense to get started.</p>
            </div>
          ) : (
            <div className="recent-list">
              {stats.recent.map((e) => {
                const meta = categoryMeta(e.category);
                return (
                  <div className="recent-item" key={e.id}>
                    <div className="recent-icon" style={{ background: meta.bg }}>{meta.icon}</div>
                    <div className="recent-info">
                      <div className="recent-title">{e.title}</div>
                      <div className="recent-meta">{e.category} · {fmtDate(e.date)}</div>
                    </div>
                    <div className="recent-amount">{fmt(e.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ExpenseForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}

function StatCard({ label, value, icon, color, bg, sub, link }) {
  const content = (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <span style={{ fontSize: '1.125rem' }}>{icon}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}
