const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};