import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


// Registrar módulos de AG Grid (obligatorio desde v28+)
ModuleRegistry.registerModules([AllCommunityModule]);

// Define el tipo para expenses
type Expense = {
  id: string;
  created_at: string;
  user_id: string;
  username: string;
  expense: number;
  expense_name: string;
};

type MyGridProps = {
  rowData: Expense[] | null;
};

const columnDefs: ColDef<Expense>[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'created_at', headerName: 'Fecha' },
  { field: 'user_id', headerName: 'Usuario' },
  { field: 'username', headerName: 'Nombre' },
  { field: 'expense', headerName: 'Gasto' },
  { field: 'expense_name', headerName: 'Nombre del gasto' },
];

const MyGrid: React.FC<MyGridProps> = ({ rowData }) => {
  console.log("rowData en MyGrid", rowData);
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact<Expense>
        rowData={rowData ?? []}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true }}
      />
    </div>
  );
};

export default MyGrid;
