const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getStats = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const [totals, byCategory, recent, monthlyTrend] = await Promise.all([
      Expense.aggregate([
        { $match: { user: uid } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            monthly: {
              $sum: { $cond: [{ $gte: ['$date', monthStart] }, '$amount', 0] },
            },
          },
        },
      ]),

      Expense.aggregate([
        { $match: { user: uid } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $project: { category: '$_id', total: 1, _id: 0 } },
      ]),

      Expense.find({ user: uid }).sort({ date: -1, createdAt: -1 }).limit(5).lean(),

      Expense.aggregate([
        { $match: { user: uid } },
        { $group: { _id: { $substr: ['$date', 0, 7] }, total: { $sum: '$amount' } } },
        { $sort: { _id: -1 } },
        { $limit: 6 },
        { $project: { month: '$_id', total: 1, _id: 0 } },
      ]),
    ]);

    const stats = totals[0] || { total: 0, monthly: 0, count: 0 };

    res.json({
      total: stats.total,
      monthly: stats.monthly,
      count: stats.count,
      byCategory,
      recent: recent.map((e) => ({ ...e, id: e._id })),
      monthlyTrend: monthlyTrend.reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { search = '', category = '', startDate = '', endDate = '', page = 1, limit = 10, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    const query = { user: req.user.id };

    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ title: re }, { notes: re }];
    }
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const sortMap = { date: 'date', amount: 'amount', title: 'title', created_at: 'createdAt' };
    const col = sortMap[sortBy] || 'date';
    const dir = sortOrder === 'ASC' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, expenses] = await Promise.all([
      Expense.countDocuments(query),
      Expense.find(query).sort({ [col]: dir }).skip(skip).limit(parseInt(limit)).lean(),
    ]);

    res.json({
      expenses: expenses.map((e) => ({ ...e, id: e._id })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, amount, category, date, notes = '' } = req.body;

    if (!title || !amount || !category || !date)
      return res.status(400).json({ error: 'Title, amount, category, and date are required' });
    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be a positive number' });

    const expense = await Expense.create({ user: req.user.id, title: title.trim(), amount: Number(amount), category, date, notes: notes.trim() });
    res.status(201).json(expense);
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, amount, category, date, notes = '' } = req.body;

    if (!title || !amount || !category || !date)
      return res.status(400).json({ error: 'All fields are required' });
    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be a positive number' });

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title: title.trim(), amount: Number(amount), category, date, notes: notes.trim() },
      { new: true, runValidators: true }
    );

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

exports.remove = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
