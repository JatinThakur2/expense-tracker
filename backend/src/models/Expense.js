const { Schema, model } = require('mongoose');

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

const expenseSchema = new Schema(
  {
    user:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:    { type: String, required: true, trim: true },
    amount:   { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATEGORIES },
    date:     { type: String, required: true },
    notes:    { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

expenseSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

module.exports = model('Expense', expenseSchema);
