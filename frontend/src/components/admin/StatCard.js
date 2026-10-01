import React from "react";


function StatCard({
  title,
  value,
  icon,
  type
}) {

  return (

    <div className="stat-card">

      <div className={`stat-icon ${type}`}>
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


export default StatCard;