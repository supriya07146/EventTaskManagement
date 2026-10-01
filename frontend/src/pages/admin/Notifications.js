import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Search,
  Trash2,
  Check,
  RefreshCw,
  UserPlus,
  CalendarPlus,
  ClipboardCheck,
  Clock,
  CalendarX,
  UserCheck
} from "lucide-react";

import "./NotificationsManagement.css";


const NotificationsManagement = () => {

  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);


  const getToken = () => {
    return localStorage.getItem("accessToken");
  };


  const fetchNotifications = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setNotifications(response.data);

    } catch (error) {

      console.error(
        "Error fetching notifications:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);


  const deleteNotification = async (id) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/api/notifications/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setNotifications(
        notifications.filter(
          notification => notification.id !== id
        )
      );

    } catch (error) {

      console.error(
        "Error deleting notification:",
        error
      );

    }
  };


  const markAsRead = async (notification) => {

    try {

      await axios.put(
        `http://127.0.0.1:8000/api/notifications/${notification.id}/`,
        {
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          user: notification.user,
          is_read: true
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setNotifications(
        notifications.map(item =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );

    } catch (error) {

      console.error(
        "Error marking notification:",
        error
      );

    }
  };


  const getIcon = (type) => {

    switch (type) {

      case "new_user":
        return <UserPlus size={20} />;

      case "new_event":
        return <CalendarPlus size={20} />;

      case "new_registration":
        return <UserCheck size={20} />;

      case "task_completed":
        return <ClipboardCheck size={20} />;

      case "task_overdue":
        return <Clock size={20} />;

      case "event_cancelled":
        return <CalendarX size={20} />;

      default:
        return <Bell size={20} />;
    }
  };


  const filteredNotifications = notifications.filter(
    notification => {

      const matchesSearch =
        notification.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.message
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        notification.notification_type === filter;

      return matchesSearch && matchesFilter;
    }
  );


  return (

    <div className="notifications-management">

      {/* HEADER */}

      <div className="notifications-header">

        <div>

          <div className="notifications-title">

            <Bell size={28} />

            <div>
              <h1>Notifications Management</h1>

              <p>
                Manage all system notifications
              </p>
            </div>

          </div>

        </div>


        <button
          className="refresh-btn"
          onClick={fetchNotifications}
        >

          <RefreshCw
            size={18}
            className={loading ? "rotate" : ""}
          />

          Refresh

        </button>

      </div>


      {/* TOOLBAR */}

      <div className="notifications-toolbar">

        <div className="notification-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >

          <option value="all">
            All Notifications
          </option>

          <option value="new_user">
            New User Registered
          </option>

          <option value="new_event">
            New Event Created
          </option>

          <option value="new_registration">
            New Registration
          </option>

          <option value="task_completed">
            Task Completed
          </option>

          <option value="task_overdue">
            Task Overdue
          </option>

          <option value="event_cancelled">
            Event Cancelled
          </option>

        </select>

      </div>


      {/* NOTIFICATION LIST */}

      <div className="notifications-card">

        <div className="notifications-card-header">

          <div>
            <h2>All Notifications</h2>

            <span>
              {filteredNotifications.length} notifications
            </span>
          </div>

        </div>


        {loading ? (

          <div className="notification-empty">
            Loading notifications...
          </div>

        ) : filteredNotifications.length === 0 ? (

          <div className="notification-empty">

            <Bell size={42} />

            <h3>No notifications found</h3>

            <p>
              Notifications will appear here
              automatically.
            </p>

          </div>

        ) : (

          <div className="notification-list">

            {filteredNotifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={`notification-row ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                >

                  <div className="notification-icon">

                    {getIcon(
                      notification.notification_type
                    )}

                  </div>


                  <div className="notification-content">

                    <div className="notification-top">

                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.is_read && (
                        <span className="new-badge">
                          NEW
                        </span>
                      )}

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <span className="notification-date">

                      {new Date(
                        notification.created_at
                      ).toLocaleString()}

                    </span>

                  </div>


                  <div className="notification-actions">

                    {!notification.is_read && (

                      <button
                        title="Mark as read"
                        onClick={() =>
                          markAsRead(notification)
                        }
                      >
                        <Check size={18} />
                      </button>

                    )}


                    <button
                      className="delete-btn"
                      title="Delete"
                      onClick={() =>
                        deleteNotification(
                          notification.id
                        )
                      }
                    >

                      <Trash2 size={18} />

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );
};


export default NotificationsManagement;