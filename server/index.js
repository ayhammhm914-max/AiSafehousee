const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

const { CLIENT_URL } = require('./config/auth');

const app = express();
const explicitOrigins = new Set([
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (explicitOrigins.has(origin)) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):(51\d{2}|52\d{2})$/.test(origin);
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('This origin is not allowed to call the API.'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/models', require('./routes/models'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/aimaster', require('./routes/aimaster'));
app.use('/api/account', require('./routes/account'));
app.use('/api/auth', require('./routes/auth'));

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || 'Something went wrong on the server.',
    code: error.code || 'SERVER_ERROR',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
