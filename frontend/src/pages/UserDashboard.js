import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaCalendarAlt,
  FaClipboardList,
  FaTasks,
  FaBell,
  FaUserCircle,
  FaArrowRight,
  FaSyncAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaBan,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import "../styles/user/userDashboard.css";

const API_URL = "http://127.0.0.1:8000";

const UserDashboard = () => {

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    registered_events: 0,
    upcoming_events: 0,
    pending_tasks: 0,
    notifications: 0,
  });

  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // USER
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const token = localStorage.getItem("accessToken");

  const username =
    storedUser.username ||
    storedUser.full_name ||
    storedUser.name ||
    storedUser.email?.split("@")[0] ||
    "User";

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {

    try {

      setError("");

      const response = await axios.get(
        `${API_URL}/api/dashboard/user/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboardData(response.data);

    } catch (err) {

      console.error(
        "Dashboard fetch error:",
        err
      );

      setError(
        err.response?.data?.error ||
        "Unable to load dashboard data."
      );

    }

  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/api/profile/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(
        response.data?.user ||
        response.data
      );

    } catch (err) {

      console.error(
        "Profile fetch error:",
        err
      );

    }

  };

  // =====================================================
  // FETCH RECENT ACTIVITY
  // (built from the user's latest registrations)
  // =====================================================

  const fetchActivities = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/api/registrations/my/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const latest = [...list]
        .sort(
          (a, b) =>
            new Date(b.registered_at || 0) -
            new Date(a.registered_at || 0)
        )
        .slice(0, 5);

      setActivities(latest);

    } catch (err) {

      console.error(
        "Activity fetch error:",
        err
      );

    }

  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    const loadData = async () => {

      if (!token) {

        setError(
          "Please login again to continue."
        );

        setLoading(false);

        return;
      }

      try {

        await Promise.all([
          fetchDashboard(),
          fetchProfile(),
          fetchActivities(),
        ]);

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await Promise.all([
        fetchDashboard(),
        fetchProfile(),
        fetchActivities(),
      ]);

    } finally {

      setRefreshing(false);

    }

  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login");

  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getProfileImage = () => {

    if (!profile?.profile_image) {
      return null;
    }

    if (
      profile.profile_image.startsWith("http")
    ) {
      return profile.profile_image;
    }

    return `${API_URL}${profile.profile_image}`;

  };

  const profileImage = getProfileImage();

  // =====================================================
  // ACTIVITY HELPERS
  // =====================================================

  const getActivityMeta = (status) => {

    switch (status) {

      case "approved":
        return {
          icon: <FaCheckCircle />,
          text: "Registration approved",
        };

      case "rejected":
        return {
          icon: <FaTimesCircle />,
          text: "Registration rejected",
        };

      case "cancelled":
        return {
          icon: <FaBan />,
          text: "Registration cancelled",
        };

      default:
        return {
          icon: <FaHourglassHalf />,
          text: "Registration pending",
        };

    }

  };

  const formatActivityDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-loading">

          <FaSyncAlt className="dashboard-loading-icon" />

          <p>
            Loading your dashboard...
          </p>

        </div>

      </div>

    );

  }

  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="dashboard-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div className="dashboard-title-row">

          <div className="dashboard-page-icon">
            <FaCalendarAlt />
          </div>

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Manage your events, tasks and activities
            </p>

          </div>

        </div>


        <div className="dashboard-header-actions">

          {/* NOTIFICATIONS */}

          <button
            className="dashboard-icon-btn notification-button"
            onClick={() =>
              navigate("/user/notifications")
            }
            title="Notifications"
          >

            <FaBell />

            {dashboardData.notifications > 0 && (

              <span className="dashboard-notification-badge">

                {dashboardData.notifications > 99
                  ? "99+"
                  : dashboardData.notifications}

              </span>

            )}

          </button>


          {/* PROFILE */}

          <button
            className="dashboard-profile-button"
            onClick={() =>
              navigate("/user/profile")
            }
          >

            <div className="dashboard-avatar">

              {profileImage ? (

                <img
                  src={profileImage}
                  alt="Profile"
                />

              ) : (

                <FaUserCircle />

              )}

            </div>

            <div className="dashboard-profile-info">

              <strong>
                {username}
              </strong>

              <span>
                User
              </span>

            </div>

          </button>


          {/* REFRESH */}

          <button
            className="dashboard-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
          >

            <FaSyncAlt
              className={
                refreshing
                  ? "dashboard-refresh-spin"
                  : ""
              }
            />

            <span>
              Refresh
            </span>

          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="dashboard-error">
          {error}
        </div>

      )}


      {/* =================================================
          WELCOME
      ================================================= */}

      <div className="dashboard-welcome">

        <div>

          <span className="dashboard-welcome-label">
            Welcome back
          </span>

          <h2>
            {username} 👋
          </h2>

          <p>
            Here's what's happening with your events
            and tasks.
          </p>

        </div>


        <button
          className="dashboard-profile-link"
          onClick={() =>
            navigate("/user/profile")
          }
        >

          View Profile

          <FaArrowRight />

        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="dashboard-section-title">

        <div>

          <h2>
            Overview
          </h2>

          <p>
            Your current activity at a glance
          </p>

        </div>

      </div>


      <div className="dashboard-stats-grid">


        {/* REGISTERED EVENTS */}

        <div
          className="dashboard-stat-card"
          onClick={() =>
            navigate("/user/registrations")
          }
        >

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon events">
              <FaCalendarAlt />
            </div>

            <FaArrowRight className="dashboard-stat-arrow" />

          </div>

          <div className="dashboard-stat-content">

            <span>
              Registered Events
            </span>

            <strong>
              {dashboardData.registered_events}
            </strong>

            <small>
              Events you registered for
            </small>

          </div>

        </div>


        {/* UPCOMING EVENTS */}

        <div
          className="dashboard-stat-card"
          onClick={() =>
            navigate("/user/events")
          }
        >

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon upcoming">
              <FaClipboardList />
            </div>

            <FaArrowRight className="dashboard-stat-arrow" />

          </div>

          <div className="dashboard-stat-content">

            <span>
              Upcoming Events
            </span>

            <strong>
              {dashboardData.upcoming_events}
            </strong>

            <small>
              Events coming soon
            </small>

          </div>

        </div>


        {/* PENDING TASKS */}

        <div
          className="dashboard-stat-card"
          onClick={() =>
            navigate("/user/tasks")
          }
        >

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon tasks">
              <FaTasks />
            </div>

            <FaArrowRight className="dashboard-stat-arrow" />

          </div>

          <div className="dashboard-stat-content">

            <span>
              Pending Tasks
            </span>

            <strong>
              {dashboardData.pending_tasks}
            </strong>

            <small>
              Tasks waiting for you
            </small>

          </div>

        </div>


        {/* NOTIFICATIONS */}

        <div
          className="dashboard-stat-card"
          onClick={() =>
            navigate("/user/notifications")
          }
        >

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon notifications">
              <FaBell />
            </div>

            <FaArrowRight className="dashboard-stat-arrow" />

          </div>

          <div className="dashboard-stat-content">

            <span>
              Notifications
            </span>

            <strong>
              {dashboardData.notifications}
            </strong>

            <small>
              Updates and alerts
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          QUICK ACCESS  +  RECENT ACTIVITY (side by side)
      ================================================= */}

      <div className="dashboard-split">


        {/* ---------------- RECENT ACTIVITY ---------------- */}

        <section className="dashboard-split-col">

          <div className="dashboard-section-title dashboard-section-row">

            <div>

              <h2>
                Recent Activity
              </h2>

              <p>
                Your latest event registrations
              </p>

            </div>

            {activities.length > 0 && (

              <button
                className="dashboard-view-all"
                onClick={() =>
                  navigate("/user/registrations")
                }
              >

                View all

                <FaArrowRight />

              </button>

            )}

          </div>


          <div className="dashboard-activity-panel">

            {activities.length === 0 ? (

              <div className="dashboard-activity-empty">

                <div className="dashboard-activity-empty-icon">
                  <FaClipboardList />
                </div>

                <h3>
                  No recent activity
                </h3>

                <p>
                  Register for an event and it will show up here.
                </p>

                <button
                  className="dashboard-view-all"
                  onClick={() =>
                    navigate("/user/events")
                  }
                >

                  Browse events

                  <FaArrowRight />

                </button>

              </div>

            ) : (

              <ul className="dashboard-activity-list">

                {activities.map((activity) => {

                  const meta =
                    getActivityMeta(activity.status);

                  return (

                    <li
                      className="dashboard-activity-item"
                      key={activity.id}
                      onClick={() =>
                        navigate("/user/registrations")
                      }
                    >

                      <div
                        className={`dashboard-activity-icon status-${activity.status}`}
                      >
                        {meta.icon}
                      </div>

                      <div className="dashboard-activity-info">

                        <strong>
                          {activity.event_title}
                        </strong>

                        <span>
                          {meta.text}
                        </span>

                      </div>

                      <small className="dashboard-activity-date">
                        {formatActivityDate(
                          activity.registered_at
                        )}
                      </small>

                    </li>

                  );

                })}

              </ul>

            )}

          </div>

        </section>


        {/* ---------------- QUICK ACCESS ---------------- */}

        <section className="dashboard-split-col">

          <div className="dashboard-section-title">

            <div>

              <h2>
                Quick Access
              </h2>

              <p>
                Access your important modules quickly
              </p>

            </div>

          </div>


          <div className="dashboard-module-grid">


            {/* EVENTS */}

            <div
              className="dashboard-module-card"
              onClick={() =>
                navigate("/user/events")
              }
            >

              <div className="dashboard-module-icon events">
                <FaCalendarAlt />
              </div>

              <div className="dashboard-module-content">

                <h3>
                  Events
                </h3>

                <p>
                  Browse and register for events
                </p>

              </div>

              <FaArrowRight className="dashboard-module-arrow" />

            </div>


            {/* REGISTRATIONS */}

            <div
              className="dashboard-module-card"
              onClick={() =>
                navigate("/user/registrations")
              }
            >

              <div className="dashboard-module-icon registrations">
                <FaClipboardList />
              </div>

              <div className="dashboard-module-content">

                <h3>
                  My Registrations
                </h3>

                <p>
                  View your registered events
                </p>

              </div>

              <FaArrowRight className="dashboard-module-arrow" />

            </div>


            {/* TASKS */}

            <div
              className="dashboard-module-card"
              onClick={() =>
                navigate("/user/tasks")
              }
            >

              <div className="dashboard-module-icon tasks">
                <FaTasks />
              </div>

              <div className="dashboard-module-content">

                <h3>
                  My Tasks
                </h3>

                <p>
                  Track your assigned tasks
                </p>

              </div>

              <FaArrowRight className="dashboard-module-arrow" />

            </div>

          </div>

        </section>

      </div>


      {/* =================================================
          FOOTER ACTION
      ================================================= */}

      <div className="dashboard-footer">

        <button
          className="dashboard-logout-btn"
          onClick={handleLogout}
        >

          <FaSignOutAlt />

          Logout

        </button>

      </div>


    </div>

  );

};

export default UserDashboard;