import React from "react";


function ModulePage({
  icon,
  title,
  description,
  children
}) {

  return (

    <div className="module-page">

      <div className="module-header">

        <div className="module-title">

          <div className="module-title-icon">
            {icon}
          </div>

          <div>

            <h2>
              {title}
            </h2>

            <p>
              {description}
            </p>

          </div>

        </div>

      </div>


      <div className="module-body">

        {children}

      </div>

    </div>

  );

}


export default ModulePage;