import React from "react";
import "./index.css";

const TaskList = ({ tasks, filterStatus, setFilterStatus, refreshTasks }) => {
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`https://thworks-assignment.onrender.com/tasks/${id}`, {
        method: "DELETE",
      });
      refreshTasks(filterStatus);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="task-list">
      <div className="header-container">
        <h2 className="heading">Tasks</h2>

        <div className="filter-container">
          <label htmlFor="filterStatus" className="filter-status">Filter by Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.due_date || "—"}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-tasks">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
