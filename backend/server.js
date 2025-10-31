const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const dbPath = path.join(__dirname, "tasks.db");
let db = null;

// Initialize DB and server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create tasks table if not exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'Medium',
        due_date TEXT
      );
    `);
    console.log("Tasks table ready");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ---------------- API ROUTES ----------------


// To Know Backend is Running or not
app.get('/', (req, res) => {
  res.send('Task Manager Backend is Running');
});


// 1️ GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = "SELECT * FROM tasks WHERE 1=1";
    if (status) query += ` AND status='${status}'`;
    if (priority) query += ` AND priority='${priority}'`;
    const tasks = await db.all(query);
    res.json(tasks);
  } catch (e) {
    res.status(500).send("Error fetching tasks");
  }
});


// 2️ POST new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const addQuery = `
        INSERT INTO tasks (title, description, status, priority, due_date)
        VALUES (?, ?, ?, ?, ?);
    `;
    await db.run(addQuery, [title, description, status, priority, due_date]);
    await db.run(addQuery);
    res.send("Task Added Successfully");
  } catch (e) {
    res.status(400).send("Error adding task");
  }
});


// 3️ PATCH update task
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    const updateQuery = `
    UPDATE tasks
    SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date)
    WHERE id = ?;
    `;
    await db.run(updateQuery, [title, description, status, priority, due_date, id]);
  } catch (e) {
    res.status(400).send("Error updating task");
  }
});


// 4  DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM tasks WHERE id = ?;`;
    const result = await db.run(deleteQuery, [id]);

    if (result.changes === 0) {
      return res.status(404).send("Task not found");
    }

    res.send("Task Deleted Successfully");
  } catch (e) {
    res.status(400).send("Error deleting task");
  }
});


// 5️ GET insights
app.get("/insights", async (req, res) => {
  try {
    const statusSummary = await db.all(`
      SELECT status, COUNT(*) as count FROM tasks GROUP BY status;
    `);
    const prioritySummary = await db.all(`
      SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority;
    `);
    const dueSoonTasks = await db.all(`
      SELECT * FROM tasks 
      WHERE due_date <= date('now', '+3 days')
      AND status != 'completed';
    `);
    const totalTasks = await db.get(`SELECT COUNT(*) as total FROM tasks;`);

    let topPriority = "None";
    if (prioritySummary.length > 0) {
      prioritySummary.sort((a, b) => b.count - a.count);
      topPriority = prioritySummary[0].priority;
    }

    const summaryText = `You have ${totalTasks.total} total tasks. Most are ${topPriority} priority. ${dueSoonTasks.length} tasks are due within 3 days.`;

    res.json({
      totalTasks: totalTasks.total,
      statusSummary,
      prioritySummary,
      dueSoonCount: dueSoonTasks.length,
      summaryText,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Error generating insights");
  }
});
