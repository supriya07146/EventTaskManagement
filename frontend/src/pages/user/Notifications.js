import React, { useEffect, useState } from "react";

import {
  FaBell,
  FaCheckCircle,
  FaTrash,
  FaCalendarAlt,
  FaTasks,
  FaUserPlus,
  FaEdit,
  FaTimes,
  FaSpinner
} from "react-icons/fa";

import "../../styles/user/notifications.css";

const API_URL = "http://127.0.0.1:8000";


function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  const token = localStorage.getItem("accessToken");


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/notifications/`,
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
          "Unable to load notifications."
        );

      }

      setNotifications(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchNotifications();

  }, []);


  // =====================================================
  // MARK AS READ
  // =====================================================

  const markAsRead = async (notification) => {

    try {

      const response = await fetch(
        `${API_URL}/api/notifications/${notification.id}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            is_read: true
          })
        }
      );

      if (!response.ok) {

        const data = await response.json();

        throw new Error(
          data.detail ||
          data.error ||
          "Unable to update notification."
        );

      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );

    } catch (err) {

      setError(err.message);

    }
  };


  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = async (notification) => {

    try {

      const response = await fetch(
        `${API_URL}/api/notifications/${notification.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {

        const data = await response.json();

        throw new Error(
          data.detail ||
          data.error ||
          "Unable to delete notification."
        );

      }

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notification.id
        )
      );

    } catch (err) {

      setError(err.message);

    }
  };


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    const unread = notifications.filter(
      (item) => !item.is_read
    );

    for (const notification of unread) {

      await markAsRead(notification);

    }
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotifications =
    notifications.filter((notification) => {

      if (filter === "unread") {
        return !notification.is_read;
      }

      if (filter === "read") {
        return notification.is_read;
      }

      return true;
    });


  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const readCount = notifications.filter(
    (item) => item.is_read
  ).length;


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };


  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon = (type) => {

    if (
      type?.includes("task")
    ) {
      return <FaTasks />;
    }

    if (
      type?.includes("registration")
    ) {
      return <FaUserPlus />;
    }

    if (
      type?.includes("event")
    ) {
      return <FaCalendarAlt />;
    }

    if (
      type?.includes("updated")
    ) {
      return <FaEdit />;
    }

    return <FaBell />;
  };


  // =====================================================
  // TYPE CLASS
  // =====================================================

  const getTypeClass = (type) => {

    if (type?.includes("task")) {
      return "task";
    }

    if (type?.includes("registration")) {
      return "registration";
    }

    if (type?.includes("event")) {
      return "event";
    }

    if (type?.includes("user")) {
      return "user";
    }

    return "general";
  };


  return (
    <div className="notifications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="notifications-header">

        <div className="notifications-title">

          <div className="notifications-title-icon">
            <FaBell />
          </div>

          <div>

            <h1>Notifications</h1>

            <p>
              Stay updated with your latest activities
            </p>

          </div>

        </div>


        {unreadCount > 0 && (

          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            <FaCheckCircle />
            Mark all as read
          </button>

        )}

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="notification-summary">

        <div className="notification-summary-card">

          <div className="summary-number">
            {notifications.length}
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>All activity</strong>
          </div>

        </div>


        <div className="notification-summary-card">

          <div className="summary-number unread-number">
            {unreadCount}
          </div>

          <div>
            <span>Unread</span>
            <strong>Needs attention</strong>
          </div>

        </div>


        <div className="notification-summary-card">

          <div className="summary-number read-number">
            {readCount}
          </div>

          <div>
            <span>Read</span>
            <strong>Already viewed</strong>
          </div>

        </div>

      </div>


      {/* =================================================
          FILTER
      ================================================= */}

      <div className="notifications-filter">

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
          <span>{notifications.length}</span>
        </button>


        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread
          <span>{unreadCount}</span>
        </button>


        <button
          className={filter === "read" ? "active" : ""}
          onClick={() => setFilter("read")}
        >
          Read
          <span>{readCount}</span>
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="notification-error">

          <span>{error}</span>

          <button onClick={() => setError("")}>
            <FaTimes />
          </button>

        </div>

      )}


      {/* =================================================
          CONTENT
      ================================================= */}

      {loading ? (

        <div className="notification-empty">

          <FaSpinner className="notification-loading" />

          <p>Loading notifications...</p>

        </div>

      ) : filteredNotifications.length === 0 ? (

        <div className="notification-empty">

          <div className="empty-notification-icon">
            <FaBell />
          </div>

          <h3>
            No notifications
          </h3>

          <p>
            You're all caught up!
          </p>

        </div>

      ) : (

        <div className="notifications-list">

          {filteredNotifications.map(
            (notification) => (

              <div
                className={`notification-card ${
                  !notification.is_read
                    ? "unread"
                    : ""
                }`}
                key={notification.id}
              >

                {/* ICON */}

                <div
                  className={`notification-icon ${getTypeClass(
                    notification.notification_type
                  )}`}
                >
                  {getNotificationIcon(
                    notification.notification_type
                  )}
                </div>


                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-card-header">

                    <h3>
                      {notification.title}
                    </h3>

                    {!notification.is_read && (
                      <span className="new-dot">
                        New
                      </span>
                    )}

                  </div>


                  <p>
                    {notification.message}
                  </p>


                  <div className="notification-meta">

                    <span>
                      {notification.notification_type_display}
                    </span>

                    <span className="notification-time">
                      {formatDate(
                        notification.created_at
                      )}
                    </span>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="notification-actions">

                  {!notification.is_read && (

                    <button
                      className="read-btn"
                      title="Mark as read"
                      onClick={() =>
                        markAsRead(notification)
                      }
                    >
                      <FaCheckCircle />
                    </button>

                  )}


                  <button
                    className="delete-notification-btn"
                    title="Delete"
                    onClick={() =>
                      deleteNotification(notification)
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Notifications;