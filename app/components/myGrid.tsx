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
  // { field: 'id', headerName: 'ID' },
  // { field: 'user_id', headerName: 'Usuario' },
  { field: 'expense', headerName: 'Gasto', 
    valueFormatter: params => params.value != null ? `$${params.value}` : '',
  },
  { field: 'username', headerName: 'Nombre' },
  { field: 'expense_name', headerName: 'Nombre del gasto' },
    {
    field: 'created_at',
    headerName: 'Fecha',
    valueFormatter: params => {
      // Ejemplo: solo fecha YYYY-MM-DD
      return params.value ? new Date(params.value).toLocaleDateString() : '';
    }
  },
    {
    headerName: '',
    // field: 'actions',
    cellRenderer: (params: { context: any; data: Expense }) => (
      <button
        onClick={() => params.context.onDelete(params.data.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: 'red',
        }}
        title="Eliminar"
      >
        ❌
      </button>
    ),
    width: 60,
    // pinned: 'right',
    // suppressMenu: true,
    sortable: false,
    filter: false,
  },
  
];




const MyGrid: React.FC<MyGridProps> = ({ rowData }) => {
  console.log("rowData en MyGrid", rowData);


  //funcion para eliminar
    const handleDelete = async (id: string) => {
      if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;
      const res = await fetch(`/gitposts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        // Opcional: recarga la página o actualiza el estado local
        window.location.reload();
      } else {
        alert("Error al eliminar el gasto");
      }
  };


    // Ajusta el ancho de las columnas al ancho del grid
  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };


  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact<Expense>
        rowData={rowData ?? []}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true }}
        context={{ onDelete: handleDelete }}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default MyGrid;
