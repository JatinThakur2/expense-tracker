const mongoose = require('mongoose');

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
  console.log('MongoDB connected');
};

module.exports = connect;
