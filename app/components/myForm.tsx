import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ExpenseActionData } from "~/routes/_home.gitposts";

export function ExpenseForm() {
  const actionData = useActionData<ExpenseActionData>();
  const navigation = useNavigation();

  return (
    <Form method="post" className="mb-6 flex gap-2 items-end">
      <div>
        <label>Nombre del gasto</label>
        <input
          name="expense_name"
          type="text"
          required
          className="border px-2 py-1 rounded text-black"
        />
      </div>
      <div>
        <label>Monto</label>
        <input
          name="expense"
          type="number"
          step="0.01"
          required
          className="border px-2 py-1 rounded text-black"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={navigation.state === "submitting"}
      >
        {navigation.state === "submitting" ? "Agregando..." : "Agregar"}
      </button>
      {actionData?.error && (
        <div className="text-red-600 mb-2">{actionData.error}</div>
      )}
    </Form>
  );
}