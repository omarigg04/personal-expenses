import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export async function getAllExpenses({
  dbClient,
  query,
  page,
  limit = 10,
}: {
  dbClient: SupabaseClient<Database>;
  query: string | null;
  page: number;
  limit?: number;
}) {
  let expensesQuery = dbClient
    .from("expenses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (query) {
    expensesQuery = expensesQuery.ilike("expense_name", `%${query}%`);
  }

  const { data, error, count } = await expensesQuery;

  if (error) {
    console.log("Error occured during getAllExpenses: ", error);
  }

  return {
    data,
    error,
    totalPages: count ? Math.ceil(count / limit) : 1,
    totalExpenses: count,
    limit,
  };
}

export async function getProfileForUsername({
  dbClient,
  username,
}: {
  dbClient: SupabaseClient<Database>;
  username: string;
}) {
  const profileQuery = dbClient
    .from("profiles")
    .select("*")
    .eq("username", username);

  const { data, error } = await profileQuery;

  if (error) {
    console.log("Error occured during getProfileForUsername : ", error);
  }

  return { data, error };
}

export async function getExpenseById({
  dbClient,
  expenseId,
}: {
  dbClient: SupabaseClient<Database>;
  expenseId: string;
}) {
  const { data, error } = await dbClient
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error) {
    console.log("Error occured during getExpenseById: ", error);
  }

  return { data, error };
}