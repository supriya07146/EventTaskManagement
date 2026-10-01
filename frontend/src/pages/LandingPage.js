import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/landing.css";


function LandingPage() {

  const [data, setData] = useState({
    total_users: 0,
    total_events: 0,
    total_tasks: 0,
    total_registrations: 0,
    recent_activities: []
  });

  const [loading, setLoading] = useState(true);


  /* =====================================================
     LOAD REAL DASHBOARD DATA
  ===================================================== */

  useEffect(() => {

    const fetchLandingData = async () => {
      try {
        // 1. Public totals, no login needed
        const publicRes = await fetch(
          "http://127.0.0.1:8000/api/dashboard/public-stats/"
        );
        if (publicRes.ok) {
          const stats = await publicRes.json();
          setData((prev) => ({ ...prev, ...stats }));
        }

        // 2. Recent activity, only works for admin users
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await fetch("http://127.0.0.1:8000/api/dashboard/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          if (response.ok) {
            const result = await response.json();
            setData((prev) => ({ ...prev, ...result }));
          }
        }
      } catch (error) {
        console.error("Landing page data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();

  }, []);


  /* =====================================================
     RECENT ACTIVITIES FOR PREVIEW
  ===================================================== */

  const recentActivities =
    data.recent_activities || [];


  return (

    <div className="landing-page">

      <Navbar />


      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            <span>●</span>
            Smart Event & Task Management
          </div>


          <h1>
            Plan Better.
            <br />
            <span>Work Smarter.</span>
          </h1>


          <p>
            Manage events, organize tasks, coordinate teams,
            and keep everything under control from one
            powerful platform.
          </p>


          <div className="hero-buttons">

            <Link
              to="/register"
              className="primary-btn"
            >
              Get Started
              <span>→</span>
            </Link>


            <a
              href="#features"
              className="secondary-btn"
            >
              Explore Features
            </a>

          </div>


          <div className="hero-trust">

            <span>✓</span>
            Simple to use

            <span>✓</span>
            Organized workflow

            <span>✓</span>
            Built for teams

          </div>

        </div>


        {/* =================================================
            REAL DASHBOARD PREVIEW
        ================================================= */}

        <div className="dashboard-preview">

          <div className="preview-header">

            <div>

              <small>
                OVERVIEW
              </small>

              <h3>
                Good morning 👋
              </h3>

            </div>


            <div className="preview-avatar">
              E
            </div>

          </div>


          {/* REAL STATISTICS */}

          <div className="preview-stats">


            <div className="stat-card">

              <span className="stat-icon event-icon">
                ◈
              </span>

              <div>

                <small>
                  Total Events
                </small>

                <strong>
                  {loading
                    ? "..."
                    : data.total_events}
                </strong>

              </div>

            </div>


            <div className="stat-card">

              <span className="stat-icon task-icon">
                ✓
              </span>

              <div>

                <small>
                  Tasks
                </small>

                <strong>
                  {loading
                    ? "..."
                    : data.total_tasks}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              RECENT REAL ACTIVITIES
          ================================================= */}

          <div className="preview-task-section">

            <div className="preview-title">

              <strong>
                Recent Activity
              </strong>

              <span>
                {data.total_registrations} registrations
              </span>

            </div>


            {loading ? (

              <div className="preview-task">

                <span className="task-check">
                  •
                </span>

                <div>

                  <strong>
                    Loading activity...
                  </strong>

                  <small>
                    Please wait
                  </small>

                </div>

              </div>

            ) : recentActivities.length > 0 ? (

              recentActivities
                .slice(0, 3)
                .map((activity, index) => (

                  <div
                    className="preview-task"
                    key={`${activity.type}-${index}`}
                  >

                    <span className="task-check">
                      {activity.type === "user"
                        ? "U"
                        : activity.type === "event"
                          ? "E"
                          : activity.type === "task"
                            ? "✓"
                            : "R"}
                    </span>


                    <div>

                      <strong>
                        {activity.title}
                      </strong>

                      <small>
                        {activity.message}
                      </small>

                    </div>


                    <span
                      className={`priority ${activity.type === "user"
                          ? "low"
                          : activity.type === "event"
                            ? "medium"
                            : ""
                        }`}
                    >
                      {activity.type}
                    </span>

                  </div>

                ))

            ) : (

              <div className="preview-task">

                <span className="task-check">
                  ✓
                </span>

                <div>

                  <strong>
                    No recent activity
                  </strong>

                  <small>
                    Your activity will appear here
                  </small>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          REAL STATISTICS
      ================================================= */}

      <section className="stats-section">

        <div className="stat-item">

          <strong>
            {loading
              ? "..."
              : data.total_users}
          </strong>

          <span>
            Registered Users
          </span>

        </div>


        <div className="stat-item">

          <strong>
            {loading
              ? "..."
              : data.total_events}
          </strong>

          <span>
            Events
          </span>

        </div>


        <div className="stat-item">

          <strong>
            {loading
              ? "..."
              : data.total_tasks}
          </strong>

          <span>
            Tasks
          </span>

        </div>


        <div className="stat-item">

          <strong>
            {loading
              ? "..."
              : data.total_registrations}
          </strong>

          <span>
            Registrations
          </span>

        </div>

      </section>


      {/* =================================================
          FEATURES
      ================================================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <span>
            POWERFUL FEATURES
          </span>

          <h2>
            Everything you need to stay organized
          </h2>

          <p>
            From planning an event to completing the final
            task, EventFlow keeps your entire workflow in one
            place.
          </p>

        </div>


        <div className="features-grid">


          <div className="feature-card">

            <div className="feature-icon">
              ◈
            </div>

            <h3>
              Event Management
            </h3>

            <p>
              Create, update, manage and track events
              with all important information in one place.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ✓
            </div>

            <h3>
              Smart Task Management
            </h3>

            <p>
              Create tasks, assign responsibilities,
              set deadlines and monitor progress.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ♙
            </div>

            <h3>
              Team Collaboration
            </h3>

            <p>
              Keep everyone aligned with organized
              assignments, registrations and updates.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◉
            </div>

            <h3>
              Notifications
            </h3>

            <p>
              Stay informed about registrations,
              assignments, deadlines and important updates.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ▣
            </div>

            <h3>
              Categories
            </h3>

            <p>
              Organize events using categories and
              quickly find what you need.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◆
            </div>

            <h3>
              Secure Access
            </h3>

            <p>
              Protected accounts with authentication
              and role-based access for users and admins.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Simple from start to finish
          </h2>

        </div>


        <div className="steps">


          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Create your account
            </h3>

            <p>
              Register your account and securely access
              your personalized workspace.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              Manage your work
            </h3>

            <p>
              Discover events, create tasks and organize
              everything according to your workflow.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Track progress
            </h3>

            <p>
              Monitor tasks, registrations and notifications
              from your dashboard.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section
        className="cta-section"
        id="about"
      >

        <div>

          <span>
            READY TO GET STARTED?
          </span>

          <h2>
            Bring your events and tasks together.
          </h2>

          <p>
            Start organizing your work with EventFlow today.
          </p>

        </div>


        <Link
          to="/register"
          className="cta-button"
        >
          Create Account →
        </Link>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="logo">

            <span className="logo-icon">
              ET
            </span>

            <span>
              EventFlow
            </span>

          </div>


          <p>
            A smarter way to manage events,
            tasks and teams.
          </p>

        </div>


        <div className="footer-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>


        <div className="footer-bottom">

          © 2026 EventFlow. All rights reserved.

        </div>

      </footer>

    </div>

  );

}


export default LandingPage;