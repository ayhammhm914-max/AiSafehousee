const db = require('../config/db');

function formatProfile(reqUser, row) {
  return {
    user_id: reqUser.user_id,
    username: reqUser.username,
    name: reqUser.name,
    email: reqUser.email,
    avatar_url: reqUser.avatar_url,
    created_at: reqUser.created_at,
    updated_at: reqUser.updated_at,
    providers: reqUser.providers,
    favorite_category: row.favorite_category || 'Still exploring',
    favorite_tool: row.favorite_tool || 'No tool rated yet',
    last_activity_at: row.last_activity_at,
  };
}

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [[profileRow]] = await db.query(
      `SELECT
         COUNT(r.review_id) AS total_reviews,
         ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating_given,
         COUNT(DISTINCT m.category_id) AS explored_categories,
         MAX(r.created_at) AS last_activity_at,
         (
           SELECT c.name
           FROM reviews r2
           JOIN ai_models m2 ON m2.model_id = r2.model_id
           JOIN categories c ON c.category_id = m2.category_id
           WHERE r2.user_id = ?
           GROUP BY c.category_id, c.name
           ORDER BY COUNT(*) DESC, c.name ASC
           LIMIT 1
         ) AS favorite_category,
         (
           SELECT m3.name
           FROM reviews r3
           JOIN ai_models m3 ON m3.model_id = r3.model_id
           WHERE r3.user_id = ?
           ORDER BY r3.rating DESC, r3.created_at DESC, r3.review_id DESC
           LIMIT 1
         ) AS favorite_tool
       FROM users u
       LEFT JOIN reviews r ON r.user_id = u.user_id
       LEFT JOIN ai_models m ON m.model_id = r.model_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [userId, userId, userId]
    );

    if (!profileRow) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const [[catalogSummary]] = await db.query(
      'SELECT COUNT(*) AS total_tools, COUNT(DISTINCT category_id) AS total_categories FROM ai_models'
    );

    const [recentActivity] = await db.query(
      `SELECT
         r.review_id,
         r.rating,
         r.comment,
         r.created_at,
         m.model_id,
         m.name AS model_name,
         m.website_url,
         c.name AS category_name
       FROM reviews r
       JOIN ai_models m ON m.model_id = r.model_id
       JOIN categories c ON c.category_id = m.category_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC, r.review_id DESC
       LIMIT 6`,
      [userId]
    );

    const recommendationParams = [userId];
    let recommendationSql = `
      SELECT
        m.model_id,
        m.name,
        m.description,
        m.avg_rating,
        m.website_url,
        c.name AS category_name,
        m.is_free
      FROM ai_models m
      JOIN categories c ON c.category_id = m.category_id
      WHERE m.model_id NOT IN (
        SELECT model_id FROM reviews WHERE user_id = ?
      )
    `;

    if (profileRow.favorite_category) {
      recommendationSql += ' ORDER BY (c.name = ?) DESC, m.avg_rating DESC, m.name ASC LIMIT 4';
      recommendationParams.push(profileRow.favorite_category);
    } else {
      recommendationSql += ' ORDER BY m.avg_rating DESC, m.name ASC LIMIT 4';
    }

    const [recommendedTools] = await db.query(recommendationSql, recommendationParams);

    res.json({
      profile: formatProfile(req.user, profileRow),
      summary: {
        total_reviews: Number(profileRow.total_reviews || 0),
        average_rating_given: Number(profileRow.average_rating_given || 0),
        explored_categories: Number(profileRow.explored_categories || 0),
        total_tools_in_catalog: Number(catalogSummary?.total_tools || 0),
        total_categories_in_catalog: Number(catalogSummary?.total_categories || 0),
      },
      recent_activity: recentActivity,
      recommended_tools: recommendedTools,
    });
  } catch (error) {
    next(error);
  }
};
