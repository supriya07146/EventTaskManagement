import React from "react";

import {
  Users,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Activity,
  UserPlus,
  CalendarPlus,
  ClipboardCheck
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import QuickAction from "../../components/admin/QuickAction";


function DashboardHome() {

  return (

    <div>

      <div className="welcome-section">

        <div>

          <h2>
            Admin Dashboard
          </h2>

          <p>
            Here's what's happening in EventFlow today.
          </p>

        </div>

        <div className="date-badge">

          <Activity size={16} />

          System Overview

        </div>

      </div>


      <div className="stats-grid">

        <StatCard
          title="Total Users"
          value="0"
          icon={<Users size={23} />}
          type="blue"
        />

        <StatCard
          title="Total Events"
          value="0"
          icon={<CalendarDays size={23} />}
          type="purple"
        />

        <StatCard
          title="Total Tasks"
          value="0"
          icon={<CheckSquare size={23} />}
          type="green"
        />

        <StatCard
          title="Registrations"
          value="0"
          icon={<ClipboardList size={23} />}
          type="orange"
        />

      </div>


      <div className="dashboard-grid">


        {/* Recent Activities */}

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

            <button className="view-all-button">
              View all
            </button>

          </div>


          <div className="empty-activity">

            <div className="empty-icon">
              <Activity size={24} />
            </div>

            <h4>
              No recent activities
            </h4>

            <p>
              Recent user, event and task activities
              will appear here.
            </p>

          </div>

        </div>


        {/* Quick Actions */}

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
              icon={<UserPlus size={19} />}
              title="Add User"
              description="Create a new user"
            />

            <QuickAction
              icon={<CalendarPlus size={19} />}
              title="Add Event"
              description="Create a new event"
            />

            <QuickAction
              icon={<ClipboardCheck size={19} />}
              title="Add Task"
              description="Create a new task"
            />

          </div>

        </div>

      </div>

    </div>

  );

}


export default DashboardHome;