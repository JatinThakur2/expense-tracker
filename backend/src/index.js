require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

connect()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error('DB connection failed:', err); process.exit(1); });
