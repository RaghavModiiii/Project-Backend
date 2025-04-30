import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, RowClickedEvent } from "ag-grid-community";
import { Ticket } from "../api/ticketApi";

interface TicketsGridSectionProps {
  filteredTickets: Ticket[];
  columnDefs: ColDef<Ticket>[];
  onGridReady: (params: { api: GridApi }) => void;
  handleRowClick: (event: RowClickedEvent) => void;
  loading: boolean;
}

const TicketsGridSection: React.FC<TicketsGridSectionProps> = ({
  filteredTickets,
  columnDefs,
  onGridReady,
  handleRowClick,
  loading,
}) => (
  <div className="flex-1 overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading tickets...
      </div>
    ) : filteredTickets.length > 0 ? (
      <div className="ag-theme-alpine h-[83%] w-[95%] mx-auto">
        <AgGridReact
          onGridReady={onGridReady}
          rowData={filteredTickets}
          columnDefs={columnDefs}
          onRowClicked={handleRowClick}
          rowClassRules={{
            "ag-row-hover": () => true,
          }}
          defaultColDef={{
            sortable: true,
            resizable: true,
          }}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
        />
      </div>
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        No tickets found.
      </div>
    )}
  </div>
);

export default TicketsGridSection;
