import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import ExpenseForm from '../components/ExpenseForm';
import { CATEGORIES, categoryMeta } from '../utils/categories';

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | expense object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const searchTimer = useRef(null);

  const fetchExpenses = useCallback(async (page = 1, f = filters) => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses', {
        params: { page, limit: 10, ...f },
      });
      setExpenses(data.expenses);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(1, filters); }, []);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === 'search') {
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => fetchExpenses(1, next), 350);
    } else {
      fetchExpenses(1, next);
    }
  };

  const handleAdd = async (data) => {
    await api.post('/expenses', data);
    setModal(null);
    fetchExpenses(1);
  };

  const handleEdit = async (data) => {
    await api.put(`/expenses/${modal.id}`, data);
    setModal(null);
    fetchExpenses(pagination.page);
  };

  const handleDelete = async () => {
    await api.delete(`/expenses/${deleteTarget.id}`);
    setDeleteTarget(null);
    fetchExpenses(pagination.page);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">{pagination.total} total record{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <IconPlus /> Add expense
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ paddingBottom: '1rem' }}>
          <div className="filter-bar">
            <div className="search-wrap">
              <IconSearch />
              <input
                className="form-input"
                placeholder="Search expenses…"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <input className="form-input" type="date" style={{ width: 'auto' }} value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} title="From date" />
            <input className="form-input" type="date" style={{ width: 'auto' }} value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} title="To date" />

            {(filters.search || filters.category || filters.startDate || filters.endDate) && (
              <button className="btn btn-ghost btn-sm" onClick={() => {
                const clear = { search: '', category: '', startDate: '', endDate: '' };
                setFilters(clear);
                fetchExpenses(1, clear);
              }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-full"><div className="spinner" style={{ width: 24, height: 24 }} /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <h3>No expenses found</h3>
            <p>Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const meta = categoryMeta(exp.category);
                    return (
                      <tr key={exp.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{exp.title}</div>
                          {exp.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>{exp.notes}</div>}
                        </td>
                        <td>
                          <span className="badge" style={{ background: meta.bg, color: 'var(--text-muted)' }}>
                            {meta.icon} {exp.category}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{fmtDate(exp.date)}</td>
                        <td className="text-right amount-cell">{fmt(exp.amount)}</td>
                        <td>
                          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setModal(exp)}>
                              <IconEdit />
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteTarget(exp)}>
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Page {pagination.page} of {pagination.pages} ({pagination.total} items)</span>
              <div className="pagination-btns">
                <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => fetchExpenses(pagination.page - 1)}>← Prev</button>
                <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchExpenses(pagination.page + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <ExpenseForm
          initial={modal === 'add' ? undefined : modal}
          onSubmit={modal === 'add' ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete expense?</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: 'var(--text)' }}>{deleteTarget.title}</strong> will be permanently removed.
              </p>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
