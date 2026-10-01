import React, {
  useEffect,
  useState
} from "react";

import {
  Search,
  X,
  RefreshCw,
  Eye,
  ClipboardList,
  User,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

import "./RegistrationsManagement.css";


const REGISTRATIONS_API =
  "http://127.0.0.1:8000/api/registrations/";


function RegistrationsManagement() {

  const [registrations, setRegistrations] =
    useState([]);

  const [events, setEvents] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // Filters

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedEvent, setSelectedEvent] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");


  // Details modal

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);


  // Status modal

  const [statusRegistration, setStatusRegistration] =
    useState(null);

  const [newStatus, setNewStatus] =
    useState("");

  const [statusLoading, setStatusLoading] =
    useState(false);


  // Pagination

  const [currentPage, setCurrentPage] =
    useState(1);

  const registrationsPerPage = 7;


  // =====================================================
  // FETCH REGISTRATIONS
  // =====================================================

  const fetchRegistrations = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "accessToken"
        );

      const params =
        new URLSearchParams();


      if (searchTerm.trim()) {

        params.append(
          "search",
          searchTerm.trim()
        );

      }


      if (selectedEvent) {

        params.append(
          "event",
          selectedEvent
        );

      }


      if (selectedUser) {

        params.append(
          "user",
          selectedUser
        );

      }


      if (selectedStatus) {

        params.append(
          "status",
          selectedStatus
        );

      }


      const queryString =
        params.toString();


      const url =
        REGISTRATIONS_API +
        (
          queryString
            ? `?${queryString}`
            : ""
        );


      const response =
        await fetch(
          url,
          {
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to load registrations."
        );

      }


      setRegistrations(
        Array.isArray(data)
          ? data
          : data.registrations || []
      );

      setCurrentPage(1);

    } catch (err) {

      console.error(
        "Fetch registrations error:",
        err
      );

      setError(
        err.message ||
        "Unable to load registrations."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH EVENTS
  // =====================================================

  const fetchEvents = async () => {

    try {

      const token =
        localStorage.getItem(
          "accessToken"
        );

      const response =
        await fetch(
          `${REGISTRATIONS_API}events/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (response.ok) {

        setEvents(
          Array.isArray(data)
            ? data
            : []
        );

      }

    } catch (err) {

      console.error(
        "Fetch events error:",
        err
      );

    }

  };


  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {

    try {

      const token =
        localStorage.getItem(
          "accessToken"
        );

      const response =
        await fetch(
          `${REGISTRATIONS_API}users/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (response.ok) {

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );

      }

    } catch (err) {

      console.error(
        "Fetch users error:",
        err
      );

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchEvents();
    fetchUsers();

  }, []);


  useEffect(() => {

    const timer =
      setTimeout(
        () => {
          fetchRegistrations();
        },
        250
      );

    return () =>
      clearTimeout(timer);

  }, [
    searchTerm,
    selectedEvent,
    selectedUser,
    selectedStatus
  ]);


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {

    setSearchTerm("");
    setSelectedEvent("");
    setSelectedUser("");
    setSelectedStatus("");

  };


  // =====================================================
  // VIEW DETAILS
  // =====================================================

  const openDetails = (
    registration
  ) => {

    setSelectedRegistration(
      registration
    );

  };


  const closeDetails = () => {

    setSelectedRegistration(
      null
    );

  };


  // =====================================================
  // OPEN STATUS MODAL
  // =====================================================

  const openStatusModal = (
    registration
  ) => {

    setStatusRegistration(
      registration
    );

    setNewStatus(
      registration.status
    );

  };


  const closeStatusModal = () => {

    if (statusLoading) {
      return;
    }

    setStatusRegistration(
      null
    );

    setNewStatus("");

  };


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusUpdate =
    async () => {

      if (!statusRegistration) {
        return;
      }

      try {

        setStatusLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "accessToken"
          );


        const response =
          await fetch(
            `${REGISTRATIONS_API}${statusRegistration.id}/status/`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body: JSON.stringify({
                status: newStatus
              })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Unable to update status."
          );

        }


        setStatusRegistration(
          null
        );


        setSuccessMessage(
          "Registration status updated successfully."
        );


        await fetchRegistrations();

      } catch (err) {

        console.error(
          "Update status error:",
          err
        );

        setError(
          err.message ||
          "Unable to update status."
        );

      } finally {

        setStatusLoading(false);

      }

    };


  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge =
    (status) => {

      const statusMap = {

        pending: {
          label: "Pending",
          className:
            "registration-status pending"
        },

        approved: {
          label: "Approved",
          className:
            "registration-status approved"
        },

        rejected: {
          label: "Rejected",
          className:
            "registration-status rejected"
        },

        cancelled: {
          label: "Cancelled",
          className:
            "registration-status cancelled"
        }

      };


      const item =
        statusMap[status] ||
        {
          label: status,
          className:
            "registration-status"
        };


      return (
        <span
          className={
            item.className
          }
        >
          {item.label}
        </span>
      );

    };


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      registrations.length /
      registrationsPerPage
    );


  const startIndex =
    (currentPage - 1) *
    registrationsPerPage;


  const currentRegistrations =
    registrations.slice(
      startIndex,
      startIndex +
      registrationsPerPage
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="registrations-management">

      {/* HEADER */}

      <div className="registration-module-header">

        <div>

          <h1>
            Registrations Management
          </h1>

          <p>
            Manage event registrations
            and registration status.
          </p>

        </div>

      </div>


      {/* SUCCESS */}

      {successMessage && (

        <div className="registration-success-message">

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


      {/* ERROR */}

      {error && (

        <div className="registration-error-message">

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


      {/* FILTER TOOLBAR */}

      <div className="registrations-toolbar">


        {/* SEARCH */}

        <div className="registrations-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search registrations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (

            <button
              className="clear-registration-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={15} />
            </button>

          )}

        </div>


        {/* EVENT FILTER */}

        <select
          className="registration-filter"
          value={selectedEvent}
          onChange={(event) =>
            setSelectedEvent(
              event.target.value
            )
          }
        >

          <option value="">
            All Events
          </option>

          {events.map(
            (event) => (

              <option
                key={event.id}
                value={event.id}
              >
                {event.title}
              </option>

            )
          )}

        </select>


        {/* USER FILTER */}

        <select
          className="registration-filter"
          value={selectedUser}
          onChange={(event) =>
            setSelectedUser(
              event.target.value
            )
          }
        >

          <option value="">
            All Users
          </option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.email}
            </option>
          ))}

        </select>


        {/* STATUS FILTER */}

        <select
          className="registration-filter"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(
              event.target.value
            )
          }
        >

          <option value="">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>

          <option value="cancelled">
            Cancelled
          </option>

        </select>


        {/* REFRESH */}

        <button
          className="refresh-registration-button"
          onClick={
            fetchRegistrations
          }
          title="Refresh registrations"
        >

          <RefreshCw size={17} />

        </button>


        {/* CLEAR */}

        {(searchTerm ||
          selectedEvent ||
          selectedUser ||
          selectedStatus) && (

            <button
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear
            </button>

          )}

      </div>


      {/* RESULT COUNT */}

      {!loading &&
        !error && (

          <div className="registration-result-info">

            Showing{" "}

            <strong>
              {registrations.length}
            </strong>{" "}

            registration
            {registrations.length === 1
              ? ""
              : "s"}

          </div>

        )}


      {/* TABLE */}

      <div className="registration-table-card">

        {loading ? (

          <div className="registration-loading">

            <div className="registration-spinner"></div>

            <p>
              Loading registrations...
            </p>

          </div>

        ) : registrations.length === 0 ? (

          <div className="registration-empty">

            <div className="registration-empty-icon">

              <ClipboardList
                size={28}
              />

            </div>

            <h3>
              No registrations found
            </h3>

            <p>
              Try changing your filters
              or search.
            </p>

          </div>

        ) : (

          <>

            <div className="registration-table-wrapper">

              <table className="registration-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      User
                    </th>

                    <th>
                      Event
                    </th>

                    <th>
                      Registered
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {currentRegistrations.map(
                    (
                      registration,
                      index
                    ) => (

                      <tr
                        key={
                          registration.id
                        }
                      >

                        <td>
                          {startIndex +
                            index +
                            1}
                        </td>


                        {/* USER */}

                        <td>

                          <div className="registration-user-cell">

                            <div className="registration-user-icon">

                              <User
                                size={15}
                              />

                            </div>

                            <div>

                              <strong>
                                {
                                  registration.user_name
                                }
                              </strong>

                              <small>
                                {
                                  registration.user_email
                                }
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* EVENT */}

                        <td>

                          <div className="registration-event-cell">

                            <CalendarDays
                              size={15}
                            />

                            <span>
                              {
                                registration.event_title
                              }
                            </span>

                          </div>

                        </td>


                        {/* DATE */}

                        <td>

                          {registration.registered_at
                            ? new Date(
                              registration.registered_at
                            ).toLocaleDateString()
                            : "-"}

                        </td>


                        {/* STATUS */}

                        <td>

                          {getStatusBadge(
                            registration.status
                          )}

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="registration-actions">

                            <button
                              className="registration-view-button"
                              onClick={() =>
                                openDetails(
                                  registration
                                )
                              }
                              title="View details"
                            >

                              <Eye
                                size={15}
                              />

                            </button>


                            <button
                              className="registration-status-button"
                              onClick={() =>
                                openStatusModal(
                                  registration
                                )
                              }
                              title="Update status"
                            >

                              <CheckCircle
                                size={15}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* PAGINATION */}

            {totalPages > 1 && (

              <div className="registration-pagination">

                <button
                  disabled={
                    currentPage === 1
                  }
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
                  </strong>

                  {" "}of{" "}

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


      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}

      {selectedRegistration && (

        <div
          className="registration-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeDetails();

            }

          }}
        >

          <div className="registration-details-modal">

            <div className="registration-modal-header">

              <div>

                <h2>
                  Registration Details
                </h2>

                <p>
                  Registration #
                  {selectedRegistration.id}
                </p>

              </div>


              <button
                className="registration-close-button"
                onClick={
                  closeDetails
                }
              >

                <X size={20} />

              </button>

            </div>


            <div className="registration-detail-grid">


              <div className="registration-detail-item">

                <span>
                  User
                </span>

                <strong>
                  {
                    selectedRegistration.user_name
                  }
                </strong>

              </div>


              <div className="registration-detail-item">

                <span>
                  Email
                </span>

                <strong>
                  {
                    selectedRegistration.user_email
                  }
                </strong>

              </div>


              <div className="registration-detail-item">

                <span>
                  Event
                </span>

                <strong>
                  {
                    selectedRegistration.event_title
                  }
                </strong>

              </div>


              <div className="registration-detail-item">

                <span>
                  Status
                </span>

                <div>
                  {getStatusBadge(
                    selectedRegistration.status
                  )}
                </div>

              </div>


              <div className="registration-detail-item">

                <span>
                  Registered At
                </span>

                <strong>

                  {selectedRegistration.registered_at
                    ? new Date(
                      selectedRegistration.registered_at
                    ).toLocaleString()
                    : "-"}

                </strong>

              </div>


              <div className="registration-detail-item">

                <span>
                  Last Updated
                </span>

                <strong>

                  {selectedRegistration.updated_at
                    ? new Date(
                      selectedRegistration.updated_at
                    ).toLocaleString()
                    : "-"}

                </strong>

              </div>

            </div>


            <div className="registration-modal-actions">

              <button
                className="secondary-registration-button"
                onClick={
                  closeDetails
                }
              >
                Close
              </button>

              <button
                className="primary-registration-button"
                onClick={() => {

                  closeDetails();

                  openStatusModal(
                    selectedRegistration
                  );

                }}
              >

                Update Status

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusRegistration && (

        <div
          className="registration-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeStatusModal();

            }

          }}
        >

          <div className="registration-status-modal">

            <div className="registration-modal-header">

              <div>

                <h2>
                  Update Status
                </h2>

                <p>
                  Change registration status
                </p>

              </div>


              <button
                className="registration-close-button"
                onClick={
                  closeStatusModal
                }
                disabled={
                  statusLoading
                }
              >

                <X size={20} />

              </button>

            </div>


            <div className="status-registration-info">

              <strong>
                {
                  statusRegistration.user_name
                }
              </strong>

              <span>
                {
                  statusRegistration.event_title
                }
              </span>

            </div>


            <div className="registration-form-group">

              <label>
                Registration Status
              </label>

              <select
                value={newStatus}
                onChange={(event) =>
                  setNewStatus(
                    event.target.value
                  )
                }
                disabled={
                  statusLoading
                }
              >

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </div>


            <div className="registration-modal-actions">

              <button
                className="secondary-registration-button"
                onClick={
                  closeStatusModal
                }
                disabled={
                  statusLoading
                }
              >
                Cancel
              </button>


              <button
                className="primary-registration-button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  statusLoading
                }
              >

                {statusLoading
                  ? "Updating..."
                  : "Update Status"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default RegistrationsManagement;