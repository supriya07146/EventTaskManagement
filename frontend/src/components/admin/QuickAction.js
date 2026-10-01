import React from "react";
import { ChevronRight } from "lucide-react";


function QuickAction({
  icon,
  title,
  description
}) {

  return (

    <button className="quick-action">

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


export default QuickAction;