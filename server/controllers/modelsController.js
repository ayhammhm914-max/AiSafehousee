const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = `
      SELECT m.*, c.name AS category_name
      FROM ai_models m
      JOIN categories c ON m.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (m.name LIKE ? OR m.description LIKE ? OR m.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }

    sql += ' ORDER BY m.avg_rating DESC, m.name ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, c.name AS category_name
       FROM ai_models m
       JOIN categories c ON m.category_id = c.category_id
       WHERE m.model_id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
