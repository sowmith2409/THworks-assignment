import React, { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchTasks = async (status = "All") => {
    try {
      let url = "https://thworks-assignment.onrender.com/tasks";
      if (status !== "All") {
        url += `?status=${encodeURIComponent(status)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks(filterStatus);
  }, [filterStatus]);

  return (
    <div className="app-container">
      <h1 className="main-heading">Task Tracker with Smart Insights</h1>

      <div className="main-content">
        <div className="left-panel">
          <TaskForm refreshTasks={fetchTasks} />
        </div>

        <div className="right-panel">
          <TaskList
            tasks={tasks}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            refreshTasks={fetchTasks}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
