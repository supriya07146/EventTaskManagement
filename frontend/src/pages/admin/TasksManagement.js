import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

import "../../styles/adminDashboard.css";

const TASKS_API = "http://127.0.0.1:8000/api/tasks/";
const USERS_API = "http://127.0.0.1:8000/api/users/";

const emptyForm = {
  title: "",
  description: "",
  assigned_to: "",
  due_date: "",
  priority: "Medium",
  status: "Pending"
};

function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search + filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Add / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  // Delete modal
  const [deletingTask, setDeletingTask] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  /*
  ========================================
  FETCH TASKS
  ========================================
  */

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(TASKS_API);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Failed to load tasks."
        );
      }

      setTasks(Array.isArray(data) ? data : data.tasks || []);
      setCurrentPage(1);

    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(
        err.message || "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================================
  FETCH USERS
  ========================================
  */

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(USERS_API, {
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {})
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Failed to load users."
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );

    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  /*
  ========================================
  INITIAL LOAD
  ========================================
  */

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  /*
  ========================================
  FORM INPUT
  ========================================
  */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  /*
  ========================================
  OPEN ADD MODAL
  ========================================
  */

  const openAddModal = () => {
    setEditingTask(null);

    setFormData({
      ...emptyForm
    });

    setFormError("");
    setError("");
    setShowModal(true);
  };

  /*
  ========================================
  OPEN EDIT MODAL
  ========================================
  */

  const openEditModal = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      assigned_to: task.assigned_to
        ? String(task.assigned_to)
        : "",
      due_date: task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending"
    });

    setFormError("");
    setError("");
    setShowModal(true);
  };

  /*
  ========================================
  CLOSE MODAL
  ========================================
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingTask(null);
    setFormData({
      ...emptyForm
    });
    setFormError("");
  };

  /*
  ========================================
  ADD / EDIT TASK
  ========================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const token =
        localStorage.getItem("accessToken");

      let url = TASKS_API;
      let method = "POST";

      if (editingTask) {
        url = `${TASKS_API}${editingTask.id}/`;
        method = "PUT";
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigned_to: formData.assigned_to
          ? Number(formData.assigned_to)
          : null,
        due_date: formData.due_date || null,
        priority: formData.priority,
        status: formData.status
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data === "object") {
          const firstError =
            Object.values(data)[0];

          if (Array.isArray(firstError)) {
            throw new Error(firstError[0]);
          }

          if (typeof firstError === "string") {
            throw new Error(firstError);
          }
        }

        throw new Error(
          data.detail ||
            data.error ||
            "Unable to save task."
        );
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({
        ...emptyForm
      });

      setSuccessMessage(
        editingTask
          ? "Task updated successfully."
          : "Task created successfully."
      );

      await fetchTasks();

    } catch (err) {
      console.error("Save task error:", err);

      setFormError(
        err.message ||
          "Something went wrong while saving the task."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ========================================
  DELETE MODAL
  ========================================
  */

  const openDeleteModal = (task) => {
    setDeletingTask(task);
    setError("");
  };

  const closeDeleteModal = () => {
    if (deleteLoading) {
      return;
    }

    setDeletingTask(null);
  };

  /*
  ========================================
  DELETE TASK
  ========================================
  */

  const handleDeleteTask = async () => {
    if (!deletingTask) {
      return;
    }

    setDeleteLoading(true);

    try {
      const token =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${TASKS_API}${deletingTask.id}/`,
        {
          method: "DELETE",
          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`
                }
              : {})
          }
        }
      );

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          // Empty DELETE response
        }

        throw new Error(
          data.detail ||
            data.error ||
            "Unable to delete task."
        );
      }

      setDeletingTask(null);

      setSuccessMessage(
        "Task deleted successfully."
      );

      await fetchTasks();

    } catch (err) {
      console.error("Delete task error:", err);

      setError(
        err.message ||
          "Unable to delete task."
      );

      setDeletingTask(null);

    } finally {
      setDeleteLoading(false);
    }
  };

  /*
  ========================================
  FILTER TASKS
  ========================================
  */

  const filteredTasks = tasks.filter((task) => {
    const search =
      searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      task.title
        ?.toLowerCase()
        .includes(search) ||
      task.description
        ?.toLowerCase()
        .includes(search);

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

  /*
  ========================================
  PAGINATION
  ========================================
  */

  const totalPages = Math.ceil(
    filteredTasks.length / tasksPerPage
  );

  const startIndex =
    (currentPage - 1) * tasksPerPage;

  const currentTasks = filteredTasks.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  /*
  ========================================
  SEARCH / FILTER CHANGE
  ========================================
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter
  ]);

  /*
  ========================================
  USER NAME
  ========================================
  */

  const getUserName = (userId) => {
    if (!userId) {
      return "Unassigned";
    }

    const user = users.find(
      (item) =>
        String(item.id) === String(userId) ||
        String(item.user_id) === String(userId)
    );

    if (!user) {
      return `User #${userId}`;
    }

    return (
      user.full_name ||
      user.name ||
      user.email ||
      user.username ||
      `User #${userId}`
    );
  };

  /*
  ========================================
  INITIAL
  ========================================
  */

  const getInitial = (name) => {
    if (!name) {
      return "U";
    }

    return name.charAt(0).toUpperCase();
  };

  /*
  ========================================
  STATUS ICON
  ========================================
  */

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle size={14} />;
    }

    if (status === "In Progress") {
      return <Clock size={14} />;
    }

    return <AlertCircle size={14} />;
  };

  /*
  ========================================
  RENDER
  ========================================
  */

  return (
    <div className="tasks-management-page">

      {/* HEADER */}

      <div className="module-header">

        <div>
          <h1>Tasks Management</h1>

          <p>
            Manage tasks, assignments and task status.
          </p>
        </div>

      </div>


      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="task-success-message">

          <span>
            {successMessage}
          </span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>
      )}


      {/* ERROR MESSAGE */}

      {error && (
        <div className="task-global-error">

          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}


      {/* TOOLBAR */}

      <div className="tasks-toolbar">

        {/* SEARCH */}

        <div className="tasks-search-box">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search by task title or description..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (
            <button
              className="clear-task-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={15} />
            </button>
          )}

        </div>


        {/* STATUS FILTER */}

        <select
          className="tasks-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="">
            All Status
          </option>

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


        {/* PRIORITY FILTER */}

        <select
          className="tasks-filter"
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(
              event.target.value
            )
          }
        >
          <option value="">
            All Priority
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

        </select>


        {/* REFRESH */}

        <button
          className="refresh-tasks-button"
          onClick={fetchTasks}
          title="Refresh tasks"
        >
          <RefreshCw size={17} />
        </button>


        {/* ADD */}

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={16} />
          Add Task
        </button>

      </div>


      {/* RESULT INFO */}

      {!loading && !error && (
        <div className="tasks-result-info">

          <span>
            Showing{" "}
            <strong>
              {filteredTasks.length}
            </strong>{" "}
            task
            {filteredTasks.length !== 1
              ? "s"
              : ""}
          </span>

        </div>
      )}


      {/* TABLE */}

      <div className="tasks-table-card">

        {loading ? (

          <div className="tasks-message">

            <div className="loading-spinner"></div>

            <p>
              Loading tasks...
            </p>

          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="tasks-message">

            <div className="empty-task-icon">
              <CheckSquareIcon />
            </div>

            <h3>
              No tasks found
            </h3>

            <p>
              {searchTerm ||
              statusFilter ||
              priorityFilter
                ? "Try changing your search or filters."
                : "Create your first task to get started."}
            </p>

            {!searchTerm &&
              !statusFilter &&
              !priorityFilter && (
                <button
                  className="primary-button"
                  onClick={openAddModal}
                >
                  <Plus size={16} />
                  Add Task
                </button>
              )}

          </div>

        ) : (

          <>
            <div className="tasks-table-wrapper">

              <table className="tasks-table">

                <thead>
                  <tr>

                    <th>Task</th>

                    <th>Assigned To</th>

                    <th>Due Date</th>

                    <th>Priority</th>

                    <th>Status</th>

                    <th>Actions</th>

                  </tr>
                </thead>


                <tbody>

                  {currentTasks.map((task) => {

                    const userName =
                      getUserName(
                        task.assigned_to
                      );

                    return (
                      <tr key={task.id}>

                        {/* TASK */}

                        <td>

                          <div className="task-title-cell">

                            <strong>
                              {task.title}
                            </strong>

                            {task.description && (
                              <span>
                                {task.description}
                              </span>
                            )}

                          </div>

                        </td>


                        {/* USER */}

                        <td>

                          <div className="task-user-cell">

                            <div className="task-avatar">
                              {getInitial(
                                userName
                              )}
                            </div>

                            <span>
                              {userName}
                            </span>

                          </div>

                        </td>


                        {/* DATE */}

                        <td>
                          {task.due_date
                            ? task.due_date
                            : "No due date"}
                        </td>


                        {/* PRIORITY */}

                        <td>

                          <span
                            className={`task-priority-badge ${task.priority?.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`task-status-badge ${task.status
                              ?.toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >

                            {getStatusIcon(
                              task.status
                            )}

                            {task.status}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="task-row-actions">

                            <button
                              className="task-edit-button"
                              onClick={() =>
                                openEditModal(task)
                              }
                              title="Edit task"
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              className="task-delete-button"
                              onClick={() =>
                                openDeleteModal(
                                  task
                                )
                              }
                              title="Delete task"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>


            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="tasks-pagination">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page{" "}
                  <strong>
                    {currentPage}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalPages}
                  </strong>
                </span>

                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                >
                  Next
                </button>

              </div>
            )}

          </>
        )}

      </div>


      {/* ========================================
          ADD / EDIT MODAL
      ======================================== */}

      {showModal && (

        <div
          className="task-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="task-modal">

            {/* MODAL HEADER */}

            <div className="task-modal-header">

              <div>
                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p>
                  {editingTask
                    ? "Update task details."
                    : "Add a new task and assign it to a user."}
                </p>
              </div>

              <button
                className="task-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {formError && (
                <div className="task-form-error">
                  {formError}
                </div>
              )}


              <div className="task-form-grid">

                {/* TITLE */}

                <div className="task-form-group full">

                  <label>
                    Task Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter task title"
                    required
                  />

                </div>


                {/* ASSIGNED USER */}

                <div className="task-form-group">

                  <label>
                    Assign To
                  </label>

                  <select
                    name="assigned_to"
                    value={
                      formData.assigned_to
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {users.map((user) => (

                      <option
                        key={
                          user.id ||
                          user.user_id
                        }
                        value={
                          user.id ||
                          user.user_id
                        }
                      >
                        {user.full_name ||
                          user.name ||
                          user.email ||
                          user.username ||
                          `User #${
                            user.id ||
                            user.user_id
                          }`}
                      </option>

                    ))}

                  </select>

                </div>


                {/* DUE DATE */}

                <div className="task-form-group">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={
                      formData.due_date
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>


                {/* PRIORITY */}

                <div className="task-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>


                {/* STATUS */}

                <div className="task-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleInputChange
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


                {/* DESCRIPTION */}

                <div className="task-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter task description..."
                    rows="4"
                  />

                </div>

              </div>


              {/* MODAL ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingTask
                      ? "Save Changes"
                      : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ========================================
          DELETE CONFIRMATION MODAL
      ======================================== */}

      {deletingTask && (

        <div className="task-modal-overlay">

          <div className="task-delete-modal">

            <div className="task-delete-icon">
              <Trash2 size={22} />
            </div>

            <h2>
              Delete Task?
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingTask.title}
              </strong>
              ?
              <br />
              This action cannot be undone.
            </p>

            <div className="modal-actions">

              <button
                className="secondary-button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-button"
                onClick={handleDeleteTask}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Task"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/*
========================================
SMALL EMPTY ICON
========================================
*/

function CheckSquareIcon() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: "12px",
        background: "#eeedff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22
      }}
    >
      ✓
    </div>
  );
}

export default TasksManagement;