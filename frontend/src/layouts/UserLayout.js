import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import {
  FaHome,
  FaCalendarAlt,
  FaClipboardList,
  FaTasks,
  FaBell,
  FaUserCircle,
  FaSignOutAlt
} from "react-icons/fa";

import "../styles/user/userDashboard.css";


const UserLayout = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const username =
    user.username ||
    user.name ||
    user.email?.split("@")[0] ||
    "User";


  const handleLogout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login");
  };


  const isActive = (path) => {
    return location.pathname === path;
  };


  return (

    <div className="user-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="user-sidebar">

        <div className="user-sidebar-brand">

          <div className="user-logo">
            <FaCalendarAlt />
          </div>

          <div className="user-brand-text">
            <h2>EventFlow</h2>
            <span>User Panel</span>
          </div>

        </div>


        <nav className="user-navigation">

          <p className="user-nav-title">
            MAIN MENU
          </p>


          <button
            className={`user-nav-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>


          <button
            className={`user-nav-item ${
              isActive("/user/events") ? "active" : ""
            }`}
            onClick={() => navigate("/user/events")}
          >
            <FaCalendarAlt />
            <span>Events</span>
          </button>


          <button
            className={`user-nav-item ${
              isActive("/user/registrations") ? "active" : ""
            }`}
            onClick={() => navigate("/user/registrations")}
          >
            <FaClipboardList />
            <span>My Registrations</span>
          </button>


          <button
            className={`user-nav-item ${
              isActive("/user/tasks") ? "active" : ""
            }`}
            onClick={() => navigate("/user/tasks")}
          >
            <FaTasks />
            <span>My Tasks</span>
          </button>


          <button
            className={`user-nav-item ${
              isActive("/user/notifications") ? "active" : ""
            }`}
            onClick={() => navigate("/user/notifications")}
          >
            <FaBell />
            <span>Notifications</span>
          </button>


          <p className="user-nav-title user-nav-profile-title">
            ACCOUNT
          </p>


          <button
            className={`user-nav-item ${
              isActive("/user/profile") ? "active" : ""
            }`}
            onClick={() => navigate("/user/profile")}
          >
            <FaUserCircle />
            <span>Profile</span>
          </button>

        </nav>


        {/* ================= SIDEBAR FOOTER ================= */}

        <div className="user-sidebar-footer">

          <div className="user-sidebar-user">

            <div className="user-small-avatar">
              <FaUserCircle />
            </div>

            <div>

              <strong>
                {username}
              </strong>

              <span>
                User
              </span>

            </div>

          </div>


          <button
            className="user-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="user-main">

        <Outlet />

      </main>

    </div>
  );
};


export default UserLayout;