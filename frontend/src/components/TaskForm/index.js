import React, { useState } from "react";
import "./index.css";

const TaskForm = ({ refreshTasks}) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    due_date: "",
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.title.trim() || !task.description.trim() || !task.due_date) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    setTask({
      title: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      due_date: "",
    });

    refreshTasks();
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="heading">Add New Task</h2>

      <label htmlFor="taskTitle">Title</label>
      <input
        type="text"
        id="taskTitle"
        name="title"
        placeholder="Task title"
        value={task.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="taskDescription">Description</label>
      <textarea
        id="taskDescription"
        name="description"
        placeholder="Description"
        value={task.description}
        onChange={handleChange}
        required
      ></textarea>

      <div className="formContainer">
        <div className="form-row">
          <label htmlFor="taskStatus">Status</label>
          <select
            id="taskStatus"
            name="status"
            value={task.status}
            onChange={handleChange}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="taskPriority">Priority</label>
          <select
            id="taskPriority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="due_date"
          value={task.due_date}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="button">Add Task</button>
    </form>
  );
};

export default TaskForm;
