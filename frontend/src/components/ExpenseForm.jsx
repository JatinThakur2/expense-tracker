import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ onSubmit, onClose, initial }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: today(),
    notes: '',
    ...initial,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) setForm({ notes: '', ...initial });
  }, [initial]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.title.trim()) {
      e.title = 'Title is required';
    } else if (form.title.trim().length < 2) {
      e.title = 'Title must be at least 2 characters';
    } else if (form.title.trim().length > 100) {
      e.title = 'Title must be under 100 characters';
    }

    if (!form.amount) {
      e.amount = 'Amount is required';
    } else if (isNaN(form.amount) || Number(form.amount) <= 0) {
      e.amount = 'Enter a valid positive amount';
    } else if (Number(form.amount) > 10000000) {
      e.amount = 'Amount seems too large';
    }

    if (!form.category) {
      e.category = 'Please select a category';
    }

    if (!form.date) {
      e.date = 'Date is required';
    }

    if (form.notes.length > 300) {
      e.notes = 'Notes must be under 300 characters';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit({ ...form, title: form.title.trim(), notes: form.notes.trim(), amount: Number(form.amount) });
    } catch (err) {
      setErrors({ global: err.response?.data?.error || 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Expense' : 'New Expense'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {errors.global && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{errors.global}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Grocery run"
                maxLength={100}
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  className={`form-input ${errors.amount ? 'error' : ''}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                />
                {errors.amount && <p className="form-error">{errors.amount}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className={`form-input ${errors.date ? 'error' : ''}`}
                  type="date"
                  value={form.date}
                  onChange={set('date')}
                />
                {errors.date && <p className="form-error">{errors.date}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={form.category}
                onChange={set('category')}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Notes{' '}
                <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                className={`form-textarea ${errors.notes ? 'error' : ''}`}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any additional details…"
                rows={3}
                maxLength={300}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.125rem' }}>
                {errors.notes ? <p className="form-error">{errors.notes}</p> : <span />}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{form.notes.length}/300</span>
              </div>
            </div>

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {initial ? 'Save changes' : 'Add expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
