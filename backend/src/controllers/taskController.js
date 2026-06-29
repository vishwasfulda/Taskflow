const { pool } = require('../config/db');

const getTasks = async (req, res) => {
  const { status, priority } = req.query;

  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.userId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getTask = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const createTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks 
        (user_id, title, description, status, priority, due_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        due_date || null
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await pool.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date)
      WHERE id = ? AND user_id = ?`,
      [title, description, status, priority, due_date, req.params.id, req.userId]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const getStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS \`high_priority\`,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) AS overdue
      FROM tasks WHERE user_id = ?`,
      [req.userId]
    );
    console.log('Stats result:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats
};