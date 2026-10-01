import React, { useState } from "react";

import {
  Users,
  Search,
  X,
  RefreshCw,
  UserPlus,
  Edit,
  UserX,
  UserCheck,
  Trash2
} from "lucide-react";

import ModulePage from "../../components/admin/ModulePage";
import EmptyTable from "../../components/admin/EmptyTable";
import "./UserManagement.css";


function UsersManagement() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "user",
    is_active: true
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  // Delete
  const [deletingUser, setDeletingUser] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status update
  const [statusLoading, setStatusLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;


  /*
  ========================================
  FETCH USERS
  ========================================
  */

  const fetchUsers = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (roleFilter) {
        params.append("role", roleFilter);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const queryString = params.toString();

      const url =
        `http://127.0.0.1:8000/api/users/` +
        (queryString ? `?${queryString}` : "");


      const response = await fetch(
        url,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );


      const text = await response.text();

      console.log("STATUS:", response.status);
      console.log("SERVER RESPONSE:", text);

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error("FULL SERVER RESPONSE:", text);
        throw new Error(
          `Server returned an invalid response. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          `Failed to fetch users. Status: ${response.status}`
        );
      }

      setUsers(Array.isArray(data) ? data : data.users || []);
      setCurrentPage(1);

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          `Failed to fetch users. Status: ${response.status}`
        );
      }


      setUsers(Array.isArray(data) ? data : data.users || []);

      setCurrentPage(1);


    } catch (err) {

      console.error("Fetch users error:", err);

      setError(
        err.message ||
        "Unable to load users."
      );

    } finally {

      setLoading(false);

    }

  };


  React.useEffect(() => {

    fetchUsers();

  }, [searchTerm, roleFilter, statusFilter]);


  /*
  ========================================
  FORM INPUT
  ========================================
  */

  const handleInputChange = (event) => {

    const {
      name,
      value
    } = event.target;


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

    setEditingUser(null);

    setFormData({
      full_name: "",
      email: "",
      role: "user",
      is_active: true
    });

    setFormError("");

    setShowModal(true);

  };


  /*
  ========================================
  OPEN EDIT MODAL
  ========================================
  */

  const openEditModal = (user) => {

    setEditingUser(user);

    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      is_active: user.is_active
    });

    setFormError("");

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

    setEditingUser(null);

    setFormError("");

  };


  /*
  ========================================
  ADD / EDIT USER
  ========================================
  */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setFormError("");

    setSuccessMessage("");

    setSaving(true);


    try {

      const token = localStorage.getItem("accessToken");


      let url =
        "http://127.0.0.1:8000/api/users/";

      let method = "POST";


      /*
      EDIT USER
      */

      if (editingUser) {

        url =
          `http://127.0.0.1:8000/api/users/${editingUser.id}/`;

        method = "PUT";

      }


      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            is_active: formData.is_active
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        if (typeof data === "object") {

          const firstError =
            Object.values(data)[0];

          if (Array.isArray(firstError)) {

            throw new Error(
              firstError[0]
            );

          }

          throw new Error(
            firstError
          );

        }

        throw new Error(
          "Unable to save user."
        );

      }


      /*
      SUCCESS MESSAGE
      */

      if (editingUser) {

        setSuccessMessage(
          "User updated successfully."
        );

      } else {

        setSuccessMessage(
          "User created successfully. Login details have been emailed."
        );

      }


      setShowModal(false);

      setEditingUser(null);


      setFormData({
        full_name: "",
        email: "",
        role: "user",
        is_active: true
      });


      await fetchUsers();


    } catch (err) {

      console.error(
        "Save user error:",
        err
      );

      setFormError(
        err.message ||
        "Unable to save user."
      );

    } finally {

      setSaving(false);

    }

  };


  /*
  ========================================
  ACTIVATE / DEACTIVATE USER
  ========================================
  */

  const handleStatusChange = async (user) => {

    const newStatus =
      !user.is_active;


    try {

      setStatusLoading(user.id);

      setSuccessMessage("");

      const token =
        localStorage.getItem("accessToken");


      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${user.id}/status/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            is_active: newStatus
          })
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.error ||
          "Unable to update user status."
        );

      }


      setSuccessMessage(
        newStatus
          ? `${user.full_name} has been activated.`
          : `${user.full_name} has been deactivated.`
      );


      await fetchUsers();


    } catch (err) {

      console.error(
        "Status update error:",
        err
      );

      setError(
        err.message ||
        "Unable to update user status."
      );

    } finally {

      setStatusLoading(null);

    }

  };


  /*
  ========================================
  DELETE USER
  ========================================
  */

  const handleDeleteUser = async () => {

    if (!deletingUser) {
      return;
    }


    try {

      setDeleteLoading(true);

      setError("");

      setSuccessMessage("");


      const token =
        localStorage.getItem("accessToken");


      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${deletingUser.id}/`,
        {
          method: "DELETE",

          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.error ||
          "Unable to delete user."
        );

      }


      setSuccessMessage(
        `${deletingUser.full_name} was deleted successfully.`
      );


      setDeletingUser(null);


      await fetchUsers();


    } catch (err) {

      console.error(
        "Delete user error:",
        err
      );

      setError(
        err.message ||
        "Unable to delete user."
      );

    } finally {

      setDeleteLoading(false);

    }

  };


  /*
  ========================================
  PAGINATION
  ========================================
  */

  const totalPages =
    Math.ceil(
      users.length /
      usersPerPage
    );


  const startIndex =
    (currentPage - 1) *
    usersPerPage;


  const currentUsers =
    users.slice(
      startIndex,
      startIndex + usersPerPage
    );


  /*
  ========================================
  AVATAR
  ========================================
  */

  const getInitial = (name) => {

    if (!name) {
      return "U";
    }

    return name
      .charAt(0)
      .toUpperCase();

  };


  return (

    <ModulePage
      icon={<Users size={23} />}
      title="Users Management"
      description="Manage registered users and their accounts."
    >

      {/* SUCCESS MESSAGE */}

      {successMessage && (

        <div className="user-success-message">

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

      {error && !loading && (

        <div className="user-global-error">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* TOOLBAR */}

      <div className="users-toolbar">

        <div className="users-search-box">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (

            <button
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={15} />
            </button>

          )}

        </div>


        <select
          className="users-filter"
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
        >

          <option value="">
            All Roles
          </option>

          <option value="user">
            Users
          </option>

          <option value="admin">
            Admins
          </option>

        </select>


        <select
          className="users-filter"
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

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

        </select>


        <button
          className="refresh-users-button"
          onClick={fetchUsers}
          title="Refresh users"
        >
          <RefreshCw size={17} />
        </button>


        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <UserPlus size={16} />
          Add User
        </button>

      </div>


      {/* RESULT COUNT */}

      {!loading && !error && (

        <div className="users-result-info">

          <span>
            Showing{" "}
            <strong>
              {users.length}
            </strong>{" "}
            user{users.length !== 1 ? "s" : ""}
          </span>

        </div>

      )}


      {/* LOADING */}

      {loading && (

        <div className="users-message">

          <div className="loading-spinner"></div>

          <p>
            Loading users...
          </p>

        </div>

      )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        users.length === 0 && (

          <EmptyTable
            title="No users found"
            description={
              searchTerm ||
                roleFilter ||
                statusFilter
                ? "Try changing your search or filters."
                : "Registered users will appear here."
            }
          />

        )
      }


      {/* TABLE */}

      {!loading &&
        !error &&
        users.length > 0 && (

          <>

            <div className="users-table-container">

              <table className="users-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>User</th>

                    <th>Email</th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>Created</th>

                    <th>Actions</th>

                  </tr>

                </thead>


                <tbody>

                  {currentUsers.map((item) => (

                    <tr key={item.id}>

                      {/* ID */}

                      <td>
                        #{item.id}
                      </td>


                      {/* USER */}

                      <td>

                        <div className="table-user">

                          <div className="table-avatar">

                            {getInitial(
                              item.full_name
                            )}

                          </div>

                          <strong>
                            {item.full_name}
                          </strong>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>
                        {item.email}
                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={
                            `role-badge ${item.role}`
                          }
                        >
                          {item.role}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `status-badge ${item.is_active
                              ? "active"
                              : "inactive"
                            }`
                          }
                        >
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* CREATED */}

                      <td>

                        {new Date(
                          item.created_at
                        ).toLocaleDateString()}

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="user-actions">

                          {/* EDIT */}

                          <button
                            className="action-button edit"
                            title="Edit user"
                            onClick={() =>
                              openEditModal(item)
                            }
                          >
                            <Edit size={15} />
                          </button>


                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            className={
                              `action-button ${item.is_active
                                ? "deactivate"
                                : "activate"
                              }`
                            }
                            title={
                              item.is_active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            disabled={
                              statusLoading ===
                              item.id
                            }
                            onClick={() =>
                              handleStatusChange(item)
                            }
                          >

                            {statusLoading === item.id ? (

                              <div className="small-spinner"></div>

                            ) : item.is_active ? (

                              <UserX size={15} />

                            ) : (

                              <UserCheck size={15} />

                            )}

                          </button>


                          {/* DELETE */}

                          <button
                            className="action-button delete"
                            title="Delete user"
                            onClick={() =>
                              setDeletingUser(item)
                            }
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* PAGINATION */}

            {totalPages > 1 && (

              <div className="users-pagination">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      previous =>
                        previous - 1
                    )
                  }
                >
                  Previous
                </button>


                <div className="page-numbers">

                  {Array.from(
                    {
                      length: totalPages
                    },
                    (_, index) => index + 1
                  ).map((page) => (

                    <button
                      key={page}
                      className={
                        currentPage === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  ))}

                </div>


                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      previous =>
                        previous + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            )}

          </>

        )
      }


      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div className="add-user-overlay">

          <div className="add-user-modal">

            <div className="add-user-header">

              <div>

                <div className="modal-title-row">

                  <div className="modal-icon">
                    {editingUser ? (
                      <Edit size={19} />
                    ) : (
                      <UserPlus size={19} />
                    )}
                  </div>

                  <h2>
                    {editingUser
                      ? "Edit User"
                      : "Add New User"}
                  </h2>

                </div>

                <p>

                  {editingUser
                    ? "Update the user's account details."
                    : "Create a new EventTaskManagement account."}

                </p>

              </div>


              <button
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM ERROR */}

            {formError && (

              <div className="user-form-error">

                {formError}

              </div>

            )}


            <form
              onSubmit={handleSubmit}
            >

              {/* FULL NAME */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={
                    formData.full_name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter full name"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter email address"
                  required
                />

              </div>


              {/* ROLE + STATUS */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="is_active"
                    value={
                      formData.is_active
                        ? "true"
                        : "false"
                    }
                    onChange={(event) =>
                      setFormData(
                        previous => ({
                          ...previous,
                          is_active:
                            event.target.value ===
                            "true"
                        })
                      )
                    }
                  >

                    <option value="true">
                      Active
                    </option>

                    <option value="false">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>


              {/* INFO */}

              {!editingUser && (

                <div className="modal-info">

                  <span>ⓘ</span>

                  <p>

                    A temporary password will be
                    generated automatically and
                    sent to the user's email.

                  </p>

                </div>

              )}


              {/* ACTIONS */}

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
                    : editingUser
                      ? "Save Changes"
                      : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* DELETE CONFIRMATION MODAL */}

      {deletingUser && (

        <div className="add-user-overlay">

          <div className="delete-confirm-modal">

            <div className="delete-icon">

              <Trash2 size={22} />

            </div>


            <h2>
              Delete User?
            </h2>


            <p>

              Are you sure you want to delete{" "}

              <strong>
                {deletingUser.full_name}
              </strong>

              ?

              <br />

              This action cannot be undone.

            </p>


            <div className="modal-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setDeletingUser(null)
                }
                disabled={deleteLoading}
              >
                Cancel
              </button>


              <button
                className="delete-confirm-button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >

                {deleteLoading
                  ? "Deleting..."
                  : "Delete User"}

              </button>

            </div>

          </div>

        </div>

      )}

    </ModulePage>

  );
}

export default UsersManagement;