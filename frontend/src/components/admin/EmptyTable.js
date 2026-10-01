import React from "react";
import { ClipboardList } from "lucide-react";


function EmptyTable({
  title,
  description
}) {

  return (

    <div className="empty-table">

      <div className="empty-table-icon">

        <ClipboardList size={25} />

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>

  );

}


export default EmptyTable;