import React, { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Tags,
  ClipboardList,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  UserPlus,
  CalendarPlus,
  ClipboardCheck,
  Activity,
  ChevronRight,
  UserRound,
  ListChecks,
  CalendarCheck,
  RefreshCw
} from "lucide-react";

import "../styles/adminDashboard.css";

import UsersManagement from "./admin/UserManagement";
import EventsManagement from "./admin/EventsManagement";
import TasksManagement from "./admin/TasksManagement";
import CategoriesManagement from "./admin/CategoriesManagement";
import RegistrationsManagement from "./admin/RegistrationsManagement";
import NotificationsManagement from "./admin/Notifications";
import AdminProfile from "./admin/AdminProfile";


function AdminDashboard() {

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Users Management", icon: Users },
    { name: "Events Management", icon: CalendarDays },
    { name: "Tasks Management", icon: CheckSquare },
    { name: "Categories Management", icon: Tags },
    { name: "Registrations Management", icon: ClipboardList },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: UserCircle }
  ];


  const handleMenuClick = (page) => {

    setActivePage(page);
    setSidebarOpen(false);

  };


  const handleLogout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";

  };


  const renderContent = () => {

    switch (activePage) {

      case "Users Management":
        return <UsersManagement />;

      case "Events Management":
        return <EventsManagement />;

      case "Tasks Management":
        return <TasksManagement />;

      case "Categories Management":
        return <CategoriesManagement />;

      case "Registrations Management":
        return <RegistrationsManagement />;

      case "Notifications":
        return <NotificationsManagement />;

      case "Profile":
        return <AdminProfile />;

      default:
        return (
          <DashboardHome
            onNavigate={handleMenuClick}
          />
        );

    }

  };


  return (

    <div className="admin-layout">

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-icon">
            ET
          </div>

          <div>

            <h2>EventFlow</h2>

            <span>
              Admin Panel
            </span>

          </div>


          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>


        <nav className="sidebar-nav">

          <p className="nav-section-title">
            MAIN MENU
          </p>


          {menuItems.map((item) => {

            const Icon = item.icon;

            return (

              <button
                key={item.name}
                className={`sidebar-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleMenuClick(item.name)
                }
              >

                <Icon size={19} />

                <span>
                  {item.name}
                </span>


                {activePage === item.name && (

                  <ChevronRight
                    size={16}
                    className="active-arrow"
                  />

                )}

              </button>

            );

          })}

        </nav>


        {/* SIDEBAR USER */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="mini-avatar">

              {user.full_name
                ? user.full_name
                    .charAt(0)
                    .toUpperCase()
                : "A"}

            </div>


            <div className="sidebar-user-info">

              <strong>
                {user.full_name ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="admin-main">


        {/* HEADER */}

        <header className="admin-header">

          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >

            <Menu size={22} />

          </button>


          <div className="header-title">

            <h1>
              {activePage}
            </h1>

            <p>
              Manage your EventFlow platform
            </p>

          </div>


          <div className="header-actions">


            <button
              className="notification-button"
              onClick={() =>
                handleMenuClick(
                  "Notifications"
                )
              }
            >

              <Bell size={20} />

              <span className="notification-dot" />

            </button>


            <button
              className="profile-button"
              onClick={() =>
                handleMenuClick("Profile")
              }
            >

              <div className="header-avatar">

                {user.full_name
                  ? user.full_name
                      .charAt(0)
                      .toUpperCase()
                  : "A"}

              </div>


              <div className="header-user">

                <strong>
                  {user.full_name ||
                    "Administrator"}
                </strong>

                <span>
                  Admin
                </span>

              </div>

            </button>


            <button
              className="header-logout"
              onClick={handleLogout}
            >

              <LogOut size={18} />

              <span>
                Logout
              </span>

            </button>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <section className="admin-content">

          {renderContent()}

        </section>

      </main>

    </div>

  );

}


/* =========================================================
   DASHBOARD HOME
========================================================= */

function DashboardHome({ onNavigate }) {

  const [dashboardData, setDashboardData] =
    useState({
      total_users: 0,
      total_events: 0,
      total_tasks: 0,
      total_registrations: 0,
      recent_activities: []
    });


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const fetchDashboard =
    async () => {

      try {

        setLoading(true);
        setError("");


        const token =
          localStorage.getItem(
            "accessToken"
          );


        if (!token) {

          setError(
            "Authentication token not found."
          );

          return;

        }


        const response =
          await fetch(
            "http://127.0.0.1:8000/api/dashboard/",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );


        if (!response.ok) {

          if (response.status === 401) {

            setError(
              "Session expired. Please login again."
            );

          } else if (
            response.status === 403
          ) {

            setError(
              "Admin access required."
            );

          } else {

            setError(
              "Failed to load dashboard."
            );

          }

          return;

        }


        const data =
          await response.json();


        setDashboardData(data);

      }

      catch (error) {

        console.error(
          "Dashboard Error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );

      }

      finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchDashboard();

  }, []);


  /* =======================================================
     FORMAT ACTIVITY TIME
  ======================================================= */

  const formatActivityTime =
    (dateString) => {

      if (!dateString) {
        return "";
      }


      const date =
        new Date(dateString);


      const now =
        new Date();


      const difference =
        Math.floor(
          (now - date) / 1000
        );


      if (difference < 60) {

        return "Just now";

      }


      if (difference < 3600) {

        const minutes =
          Math.floor(
            difference / 60
          );

        return `${minutes} ${
          minutes === 1
            ? "minute"
            : "minutes"
        } ago`;

      }


      if (difference < 86400) {

        const hours =
          Math.floor(
            difference / 3600
          );

        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;

      }


      const days =
        Math.floor(
          difference / 86400
        );


      if (days < 7) {

        return `${days} ${
          days === 1
            ? "day"
            : "days"
        } ago`;

      }


      return date.toLocaleDateString();

    };


  /* =======================================================
     ACTIVITY ICON
  ======================================================= */

  const getActivityIcon =
    (type) => {

      switch (type) {

        case "user":
          return <UserRound size={18} />;

        case "event":
          return <CalendarCheck size={18} />;

        case "task":
          return <ListChecks size={18} />;

        case "registration":
          return <ClipboardList size={18} />;

        default:
          return <Activity size={18} />;

      }

    };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="dashboard-loading">

        <RefreshCw
          size={28}
          className="loading-spinner"
        />

        <p>
          Loading dashboard...
        </p>

      </div>

    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {

    return (

      <div className="dashboard-error">

        <div className="empty-icon">
          <Activity size={24} />
        </div>

        <h3>
          Unable to load dashboard
        </h3>

        <p>
          {error}
        </p>


        <button
          className="retry-button"
          onClick={fetchDashboard}
        >

          <RefreshCw size={17} />

          Try Again

        </button>

      </div>

    );

  }


  return (

    <div>


      {/* =================================================
          WELCOME
      ================================================= */}

      <div className="welcome-section">

        <div>

          <h2>
            Admin Dashboard
          </h2>

          <p>
            Here's what's happening in
            EventFlow today.
          </p>

        </div>


        <div className="date-badge">

          <Activity size={16} />

          System Overview

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">


        <StatCard
          title="Total Users"
          value={dashboardData.total_users}
          icon={<Users size={23} />}
          type="blue"
        />


        <StatCard
          title="Total Events"
          value={dashboardData.total_events}
          icon={<CalendarDays size={23} />}
          type="purple"
        />


        <StatCard
          title="Total Tasks"
          value={dashboardData.total_tasks}
          icon={<CheckSquare size={23} />}
          type="green"
        />


        <StatCard
          title="Registrations"
          value={
            dashboardData.total_registrations
          }
          icon={
            <ClipboardList size={23} />
          }
          type="orange"
        />

      </div>


      {/* =================================================
          DASHBOARD GRID
      ================================================= */}

      <div className="dashboard-grid">


        {/* ===============================================
            RECENT ACTIVITIES
        =============================================== */}

        <div className="dashboard-card activity-card">

          <div className="card-heading">

            <div>

              <h3>
                Recent Activities
              </h3>

              <p>
                Latest platform activity
              </p>

            </div>


            <button
              className="view-all-button"
              onClick={() =>
                onNavigate(
                  "Notifications"
                )
              }
            >
              View all
            </button>

          </div>


          {dashboardData
            .recent_activities
            .length === 0 ? (

            <div className="empty-activity">

              <div className="empty-icon">

                <Activity size={24} />

              </div>

              <h4>
                No recent activities
              </h4>

              <p>
                Recent user, event and
                task activities will
                appear here.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {dashboardData
                .recent_activities
                .map(
                  (activity, index) => (

                    <div
                      className="activity-item"
                      key={`${activity.type}-${index}`}
                    >


                      <div
                        className={`activity-icon ${activity.type}`}
                      >

                        {getActivityIcon(
                          activity.type
                        )}

                      </div>


                      <div className="activity-details">

                        <strong>
                          {activity.title}
                        </strong>

                        <p>
                          {activity.message}
                        </p>

                      </div>


                      <span className="activity-time">

                        {formatActivityTime(
                          activity.created_at
                        )}

                      </span>

                    </div>

                  )
                )}

            </div>

          )}

        </div>


        {/* ===============================================
            QUICK ACTIONS
        =============================================== */}

        <div className="dashboard-card quick-card">

          <div className="card-heading">

            <div>

              <h3>
                Quick Actions
              </h3>

              <p>
                Frequently used actions
              </p>

            </div>

          </div>


          <div className="quick-actions">


            <QuickAction
              icon={
                <UserPlus size={19} />
              }
              title="Add User"
              description="Create a new user"
              onClick={() =>
                onNavigate(
                  "Users Management"
                )
              }
            />


            <QuickAction
              icon={
                <CalendarPlus size={19} />
              }
              title="Add Event"
              description="Create a new event"
              onClick={() =>
                onNavigate(
                  "Events Management"
                )
              }
            />


            <QuickAction
              icon={
                <ClipboardCheck size={19} />
              }
              title="Add Task"
              description="Create a new task"
              onClick={() =>
                onNavigate(
                  "Tasks Management"
                )
              }
            />

          </div>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  type
}) {

  return (

    <div className="stat-card">

      <div
        className={`stat-icon ${type}`}
      >

        {icon}

      </div>


      <div className="stat-info">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          Current total
        </small>

      </div>

    </div>

  );

}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
  onClick
}) {

  return (

    <button
      className="quick-action"
      onClick={onClick}
    >

      <div className="quick-action-icon">

        {icon}

      </div>


      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <ChevronRight size={17} />

    </button>

  );

}


export default AdminDashboard;