const db = require('../config/db');
const { requireAuth } = require('../middleware/requireAuth');
const {
  createSession,
  deleteSession,
  getSessionById,
  listSessions,
  sendMessage,
} = require('../services/aimasterService');

exports.ensureReady = [requireAuth];

exports.listSessions = async (req, res, next) => {
  try {
    const sessions = await listSessions(req.user.user_id);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const result = await createSession(req.user.user_id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const sessionId = Number.parseInt(req.params.sessionId, 10);
    const result = await getSessionById(req.user.user_id, sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.removeSession = async (req, res, next) => {
  try {
    const sessionId = Number.parseInt(req.params.sessionId, 10);
    await deleteSession(req.user.user_id, sessionId);
    res.json({ message: 'Chat session deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.chat = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const sessionId = req.body.session_id ? Number.parseInt(req.body.session_id, 10) : null;
    const result = await sendMessage(req.user.user_id, sessionId, req.body.message, connection);

    await connection.commit();
    res.json(result);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
