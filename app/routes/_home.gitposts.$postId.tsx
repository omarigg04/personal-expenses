import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { getExpenseById, getAllExpenses } from "~/lib/database.server";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { formatToTwitterDate } from "~/lib/utils";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { postId } = params; // postId ahora es expenseId
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  if (!postId) {
    return redirect("/404", { headers });
  }

  const { data: expense } = await getExpenseById({
    dbClient: supabase,
    expenseId: postId,
  });

  if (!expense) {
    return redirect("/404", { headers });
  }

  const query = ""; // Define tu consulta aquí si es necesario
  const page = 1; // O el número de página que necesites
  const { data: expensesData } = await getAllExpenses({
    dbClient: supabase,
    query,
    page: isNaN(page) ? 1 : page,
  });
  console.log("expensesData", expensesData); // <-- agrega este log

  return json(
    {
      expense,
      sessionUserId: session.user.id,
    },
    { headers }
  );
};

export default function CurrentExpense() {
  const { expense } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        navigate(-1);
        setOpen(open);
      }}
    >

    </Dialog>
  );
}
