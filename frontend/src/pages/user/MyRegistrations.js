import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
  FaTimesCircle,
  FaClipboardList,
  FaSyncAlt
} from "react-icons/fa";

import "../../styles/user/myRegistrations.css";


const API_URL = "http://127.0.0.1:8000";


const MyRegistrations = () => {

  const [registrations, setRegistrations] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(null);


  // =====================================================
  // GET MY REGISTRATIONS
  // =====================================================

  const fetchRegistrations = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken");

      if (!token) {

        setError(
          "Please login again to view your registrations."
        );

        return;
      }


      const response = await axios.get(
        `${API_URL}/api/registrations/my/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setRegistrations(response.data);

    } catch (err) {

      console.error(
        "Registration fetch error:",
        err
      );

      setError(
        err.response?.data?.error ||
        "Unable to load registrations."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchRegistrations();

  }, []);


  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredRegistrations =
    registrations.filter((registration) => {

      const matchesSearch =
        registration.event_title
          ?.toLowerCase()
          .includes(search.toLowerCase());


      const matchesStatus =
        statusFilter === "all" ||
        registration.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // =====================================================
  // CANCEL REGISTRATION
  // =====================================================

  const cancelRegistration = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to cancel this registration?"
    );

    if (!confirmed) {
      return;
    }


    try {

      setCancelling(id);

      const token =
        localStorage.getItem("accessToken");


      const response = await axios.patch(
        `${API_URL}/api/registrations/my/${id}/cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setRegistrations((previous) =>
        previous.map((registration) =>
          registration.id === id
            ? response.data
            : registration
        )
      );


    } catch (err) {

      console.error(
        "Cancel registration error:",
        err
      );

      alert(
        err.response?.data?.error ||
        "Unable to cancel registration."
      );

    } finally {

      setCancelling(null);

    }

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {

    if (!time) {
      return "—";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes)
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );

  };


  // =====================================================
  // FORMAT REGISTERED DATE
  // =====================================================

  const formatRegisteredDate = (date) => {

    if (!date) {
      return "—";
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
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="registrations-page">

        <div className="registrations-loading">

          <FaSyncAlt className="loading-icon" />

          <p>
            Loading your registrations...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="registrations-page">


      {/* HEADER */}

      <div className="registrations-header">

        <div className="page-title-row">

          <div className="page-icon">
            <FaClipboardList />
          </div>

          <div>

            <h1>
              My Registrations
            </h1>

            <p>
              View and manage your event registrations
            </p>

          </div>

        </div>


        <button
          className="refresh-btn"
          onClick={fetchRegistrations}
        >

          <FaSyncAlt />

          <span>
            Refresh
          </span>

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="registrations-error">
          {error}
        </div>

      )}


      {/* SEARCH + FILTER */}

      <div className="registration-controls">


        <div className="registration-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search registered events..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option value="all">
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

      </div>


      {/* COUNT */}

      <div className="registration-count">

        Showing{" "}
        <strong>
          {filteredRegistrations.length}
        </strong>{" "}

        {filteredRegistrations.length === 1
          ? "registration"
          : "registrations"}

      </div>


      {/* EMPTY */}

      {filteredRegistrations.length === 0 ? (

        <div className="registrations-empty">

          <div className="empty-icon">
            <FaClipboardList />
          </div>

          <h2>
            No registrations found
          </h2>

          <p>

            {registrations.length === 0
              ? "You haven't registered for any events yet."
              : "No registrations match your search or status filter."}

          </p>

        </div>

      ) : (


        /* REGISTRATION GRID */

        <div className="registrations-grid">

          {filteredRegistrations.map(
            (registration) => (

              <div
                className="registration-card"
                key={registration.id}
              >


                {/* TOP */}

                <div className="registration-card-top">

                  <div className="event-symbol">
                    <FaCalendarAlt />
                  </div>


                  <span
                    className={`registration-status status-${registration.status}`}
                  >

                    {registration.status_display}

                  </span>

                </div>


                {/* TITLE */}

                <h2>
                  {registration.event_title}
                </h2>


                {/* DETAILS */}

                <div className="event-details">


                  {/* DATE */}

                  <div className="event-detail">

                    <FaCalendarAlt />

                    <div>

                      <span>
                        Event Date
                      </span>

                      <strong>
                        {formatDate(
                          registration.event_date
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* TIME */}

                  <div className="event-detail">

                    <FaClock />

                    <div>

                      <span>
                        Time
                      </span>

                      <strong>

                        {formatTime(
                          registration.start_time
                        )}

                        {" - "}

                        {formatTime(
                          registration.end_time
                        )}

                      </strong>

                    </div>

                  </div>


                  {/* LOCATION */}

                  <div className="event-detail">

                    <FaMapMarkerAlt />

                    <div>

                      <span>
                        Location
                      </span>

                      <strong>
                        {registration.event_location}
                      </strong>

                    </div>

                  </div>


                </div>


                {/* REGISTERED DATE */}

                <div className="registered-date">

                  Registered on{" "}

                  <strong>
                    {formatRegisteredDate(
                      registration.registered_at
                    )}
                  </strong>

                </div>


                {/* CANCEL */}

                {registration.status !==
                  "cancelled" && (

                  <button
                    className="cancel-registration-btn"
                    onClick={() =>
                      cancelRegistration(
                        registration.id
                      )
                    }
                    disabled={
                      cancelling ===
                      registration.id
                    }
                  >

                    <FaTimesCircle />

                    {cancelling ===
                    registration.id
                      ? "Cancelling..."
                      : "Cancel Registration"}

                  </button>

                )}


                {registration.status ===
                  "cancelled" && (

                  <div className="cancelled-message">

                    <FaTimesCircle />

                    Registration cancelled

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

};


export default MyRegistrations;