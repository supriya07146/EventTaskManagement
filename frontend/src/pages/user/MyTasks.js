import React, { useEffect, useState } from "react";
import {
  FaTasks,
  FaSearch,
  FaCalendarAlt,
  FaFlag,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaEdit,
  FaTimes,
  FaSave
} from "react-icons/fa";

import "../../styles/user/myTasks.css";

const API_URL = "http://127.0.0.1:8000";

function MyTasks() {

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("accessToken");


  // =====================================================
  // FETCH MY TASKS
  // =====================================================

  const fetchTasks = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/my/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          "Unable to load tasks."
        );
      }

      setTasks(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchTasks();
  }, []);


  // =====================================================
  // MARK COMPLETE
  // =====================================================

  const updateTaskStatus = async (task) => {

    try {

      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            status: "Completed"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          "Unable to update task."
        );
      }

      fetchTasks();

    } catch (err) {

      setError(err.message);

    }
  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditTask = (task) => {

    setEditingTask(task);
    setEditStatus(task.status);
    setError("");
  };


  // =====================================================
  // CLOSE EDIT
  // =====================================================

  const closeEditTask = () => {

    setEditingTask(null);
    setEditStatus("");
  };


  // =====================================================
  // SAVE EDIT
  // =====================================================

  const saveTaskEdit = async () => {

    if (!editingTask) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/${editingTask.id}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            status: editStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          "Unable to update task."
        );
      }

      closeEditTask();
      fetchTasks();

    } catch (err) {

      setError(err.message);

    } finally {

      setSaving(false);

    }
  };


  // =====================================================
  // FILTER TASKS
  // =====================================================

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch =
      task.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      task.status === statusFilter;

    const matchesPriority =
      !priorityFilter ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });


  // =====================================================
  // COUNTS
  // =====================================================

  const pendingCount = tasks.filter(
    task => task.status === "Pending"
  ).length;

  const progressCount = tasks.filter(
    task => task.status === "In Progress"
  ).length;

  const completedCount = tasks.filter(
    task => task.status === "Completed"
  ).length;


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {

    if (status === "Completed") {
      return <FaCheckCircle />;
    }

    if (status === "In Progress") {
      return <FaSpinner />;
    }

    return <FaClock />;
  };


  return (
    <div className="mytasks-page">

      {/* HEADER */}

      <div className="mytasks-header">

        <div className="mytasks-title-row">

          <div className="mytasks-title-icon">
            <FaTasks />
          </div>

          <div>
            <h1>My Tasks</h1>
            <p>
              Manage and track your assigned tasks
            </p>
          </div>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="task-summary">

        <div className="task-summary-card">

          <div className="summary-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

        </div>


        <div className="task-summary-card">

          <div className="summary-icon progress">
            <FaSpinner />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{progressCount}</strong>
          </div>

        </div>


        <div className="task-summary-card">

          <div className="summary-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>

        </div>

      </div>


      {/* FILTER BAR */}

      <div className="task-filter-bar">

        <div className="task-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">
            In Progress
          </option>
          <option value="Completed">
            Completed
          </option>
        </select>


        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

      </div>


      {/* ERROR */}

      {error && (
        <div className="task-error">
          {error}
        </div>
      )}


      {/* TASKS */}

      {loading ? (

        <div className="task-empty">

          <FaSpinner className="loading-spin" />

          <p>Loading your tasks...</p>

        </div>

      ) : filteredTasks.length === 0 ? (

        <div className="task-empty">

          <div className="empty-task-icon">
            <FaTasks />
          </div>

          <h3>No tasks found</h3>

          <p>
            You don't have any tasks matching
            the selected filters.
          </p>

        </div>

      ) : (

        <div className="tasks-grid">

          {filteredTasks.map((task) => (

            <div
              className={`task-card ${task.status
                ?.toLowerCase()
                .replace(" ", "-")}`}
              key={task.id}
            >

              {/* TOP */}

              <div className="task-card-top">

                <div className="task-card-icon">
                  <FaTasks />
                </div>

                <span
                  className={`priority-badge ${task.priority?.toLowerCase()}`}
                >
                  <FaFlag />
                  {task.priority}
                </span>

              </div>


              {/* TITLE */}

              <h3>{task.title}</h3>

              <p className="task-description">
                {task.description ||
                  "No description provided."}
              </p>


              {/* DETAILS */}

              <div className="task-details">

                <div className="task-detail-row">

                  <FaCalendarAlt />

                  <span>
                    Due: {formatDate(task.due_date)}
                  </span>

                </div>


                <div className="task-detail-row">

                  {getStatusIcon(task.status)}

                  <span>
                    {task.status}
                  </span>

                </div>

              </div>


              {/* FOOTER */}

              <div className="task-card-footer">

                <span
                  className={`status-badge ${task.status
                    ?.toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </span>


                <div className="task-actions">

                  {task.status !== "Completed" && (

                    <button
                      className="complete-task-btn"
                      onClick={() =>
                        updateTaskStatus(task)
                      }
                    >
                      <FaCheckCircle />
                      Complete
                    </button>

                  )}


                  <button
                    className="edit-task-btn"
                    onClick={() =>
                      openEditTask(task)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* =================================================
          EDIT TASK MODAL
      ================================================= */}

      {editingTask && (

        <div className="task-modal-overlay">

          <div className="task-edit-modal">

            <div className="task-modal-header">

              <div>
                <h2>Edit Task</h2>

                <p>
                  Update the status of your task
                </p>
              </div>

              <button
                className="task-modal-close"
                onClick={closeEditTask}
              >
                <FaTimes />
              </button>

            </div>


            <div className="task-edit-content">

              <div className="edit-task-info">

                <span>Task</span>

                <strong>
                  {editingTask.title}
                </strong>

              </div>


              <div className="edit-task-info">

                <span>Priority</span>

                <strong>
                  {editingTask.priority}
                </strong>

              </div>


              <label>
                Task Status
              </label>

              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value)
                }
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

            </div>


            <div className="task-modal-footer">

              <button
                className="cancel-edit-btn"
                onClick={closeEditTask}
              >
                Cancel
              </button>

              <button
                className="save-task-btn"
                onClick={saveTaskEdit}
                disabled={saving}
              >

                {saving ? (
                  <>
                    <FaSpinner className="loading-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyTasks;