import React from "react";

import {
  CalendarDays,
  ClipboardList,
  CheckSquare,
  Bell,
  ArrowRight
} from "lucide-react";

import "../../styles/user/userDashboardHome.css";


function UserDashboardHome({
  onNavigate
}) {

  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  return (

    <div className="user-home">


      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="user-welcome">

        <div>

          <p className="user-welcome-label">
            Welcome back
          </p>

          <h2>
            {user.full_name ||
              "User"} 👋
          </h2>

          <p>
            Discover events, manage your
            registrations and stay updated
            with EventFlow.
          </p>

        </div>


        <button
          className="browse-events-button"
          onClick={() =>
            onNavigate(
              "Browse Events"
            )
          }
        >

          <CalendarDays size={18} />

          Browse Events

          <ArrowRight size={17} />

        </button>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="user-stats-grid">


        <div className="user-stat-card">

          <div className="user-stat-icon blue">

            <CalendarDays size={22} />

          </div>

          <div>

            <span>
              Registered Events
            </span>

            <strong>
              0
            </strong>

            <small>
              Total registrations
            </small>

          </div>

        </div>


        <div className="user-stat-card">

          <div className="user-stat-icon purple">

            <ClipboardList size={22} />

          </div>

          <div>

            <span>
              Upcoming Events
            </span>

            <strong>
              0
            </strong>

            <small>
              Events you registered for
            </small>

          </div>

        </div>


        <div className="user-stat-card">

          <div className="user-stat-icon green">

            <CheckSquare size={22} />

          </div>

          <div>

            <span>
              My Tasks
            </span>

            <strong>
              0
            </strong>

            <small>
              Assigned tasks
            </small>

          </div>

        </div>


        <div className="user-stat-card">

          <div className="user-stat-icon orange">

            <Bell size={22} />

          </div>

          <div>

            <span>
              Notifications
            </span>

            <strong>
              0
            </strong>

            <small>
              Recent notifications
            </small>

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK SECTIONS
      ===================================================== */}

      <div className="user-home-grid">


        {/* UPCOMING */}

        <div className="user-home-card">

          <div className="user-card-heading">

            <div>

              <h3>
                Upcoming Events
              </h3>

              <p>
                Your registered events
              </p>

            </div>


            <button
              onClick={() =>
                onNavigate(
                  "My Registrations"
                )
              }
            >

              View all

            </button>

          </div>


          <div className="user-empty-state">

            <div className="user-empty-icon">

              <CalendarDays
                size={25}
              />

            </div>

            <h4>
              No upcoming events
            </h4>

            <p>
              Register for an event to
              see it here.
            </p>


            <button
              onClick={() =>
                onNavigate(
                  "Browse Events"
                )
              }
            >

              Browse Events

            </button>

          </div>

        </div>


        {/* TASKS */}

        <div className="user-home-card">

          <div className="user-card-heading">

            <div>

              <h3>
                My Tasks
              </h3>

              <p>
                Your assigned tasks
              </p>

            </div>


            <button
              onClick={() =>
                onNavigate(
                  "My Tasks"
                )
              }
            >

              View all

            </button>

          </div>


          <div className="user-empty-state">

            <div className="user-empty-icon">

              <CheckSquare
                size={25}
              />

            </div>

            <h4>
              No tasks yet
            </h4>

            <p>
              Your assigned tasks will
              appear here.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          NOTIFICATION PREVIEW
      ===================================================== */}

      <div className="user-home-card notification-preview">

        <div className="user-card-heading">

          <div>

            <h3>
              Recent Notifications
            </h3>

            <p>
              Latest updates from EventFlow
            </p>

          </div>


          <button
            onClick={() =>
              onNavigate(
                "Notifications"
              )
            }
          >

            View all

          </button>

        </div>


        <div className="user-empty-state compact">

          <div className="user-empty-icon">

            <Bell size={25} />

          </div>

          <h4>
            No new notifications
          </h4>

          <p>
            New event and registration
            updates will appear here.
          </p>

        </div>

      </div>


    </div>

  );

}


export default UserDashboardHome;
