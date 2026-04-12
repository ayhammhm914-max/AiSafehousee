const db = require('../config/db');

exports.getByModel = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.username FROM Reviews r
       JOIN Users u ON r.user_id = u.user_id
       WHERE r.model_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.model_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { user_id, model_id, rating, comment } = req.body;
    await db.query(
      'INSERT INTO Reviews (user_id, model_id, rating, comment) VALUES (?,?,?,?)',
      [user_id, model_id, rating, comment]
    );
    res.json({ message: 'Review added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};