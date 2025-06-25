import { redirect } from "@remix-run/node";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { WritePost } from "~/components/write-post";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import { Separator } from "~/components/ui/separator";
import { PostSearch } from "~/components/post-search";
import { getAllExpenses } from "~/lib/database.server";
import { combinePostsWithLikes, getUserDataFromSession } from "~/lib/utils";
import { InfiniteVirtualList } from "~/routes/stateful/infinite-virtual-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import MyGrid from '../components/myGrid';
import type { Expense } from "../../models/expense.model.ts"
import { ExpenseForm } from "../components/myForm";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const query = searchParams.get("query");
  const page = Number(searchParams.get("page")) || 1;


  // // Posts
  // const { data, totalPages, limit } = await getAllPostsWithDetails({
  //   dbClient: supabase,
  //   query,
  //   page: isNaN(page) ? 1 : page,
  // });

    const user_id = session.user.id; // <-- ID del usuario logueado

  // Expenses
  // const { data: expensesData } = await getAllExpenses({
  //   dbClient: supabase,
  //   query,
  //   page: isNaN(page) ? 1 : page,
  // });
    // Solo trae los expenses de este usuario
  const { data: expensesData } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  console.log("expensesData en loader", expensesData);

  // 2. Obtén todos los perfiles
  const { data: profilesData } = await supabase.from("profiles").select("id, username");

    // 3. Crea un mapa de user_id a username
  const userIdToUsername = new Map();
  profilesData?.forEach((profile) => {
    userIdToUsername.set(profile.id, profile.username);
  });

    // 4. Agrega el username a cada expense
  const expensesWithUsername: Expense[] = (expensesData ?? []).map((expense) => ({
    ...expense,
    username: userIdToUsername.get(expense.user_id) ?? "Desconocido",
  }));

  const {
    userId: sessionUserId,
    userAvatarUrl,
    username,
  } = getUserDataFromSession(session);

  // const posts = combinePostsWithLikes(data, sessionUserId);

  return json(
    {
      // posts,
      expenses: expensesWithUsername,
      userDetails: { sessionUserId, userAvatarUrl, username },
      query,
      // totalPages,
      // limit,
    },
    { headers }
  );
};

export type ExpenseActionData = { error?: string };

export let action = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({ request });
  if (!session) return redirect("/login", { headers });

  const formData = await request.formData();
  const expense_name = formData.get("expense_name") as string;
  const expense = Number(formData.get("expense"));
  const user_id = session.user.id;

  const { error } = await supabase.from("expenses").insert([
    {
      expense_name,
      expense,
      user_id,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return redirect("/gitposts");
};

export default function GitPosts() {
  const {
    // posts,
    expenses,
    userDetails: { sessionUserId },
    query,
    // totalPages,
  } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  // When nothing is happening, navigation.location will be undefined,
  // but when the user navigates it will be populated with the next
  // location while data loads. Then we check if they're searching with
  // location.search.
  const isSearching = Boolean(
    navigation.location &&
      new URLSearchParams(navigation.location.search).has("query")
  );

  console.log("isSearching ", true, query);

  return (
    <div className="w-full px-4 flex flex-col">
      <h1 className="text-xl font-bold mb-4">Mi tabla con AG Grid</h1>
        <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <ExpenseForm />
        <MyGrid rowData={expenses}/>
      </div>
    </div>
  );
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const skipRevalidation =
    actionResult?.skipRevalidation &&
    actionResult?.skipRevalidation?.includes("/gitposts");

  if (skipRevalidation) {
    console.log("Skipped revalidation");
    return false;
  }

  console.log("Did not skip revalidation");
  return defaultShouldRevalidate;
}
