import { json, redirect } from "@remix-run/node";
import { type LoaderFunctionArgs } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { getAllExpenses, getProfileForUsername } from "~/lib/database.server";
import { getSupabaseWithSessionHeaders } from "~/lib/supabase.server";
import MyGrid from "~/components/myGrid";

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { username } = params;
  const { supabase, headers, session } = await getSupabaseWithSessionHeaders({
    request,
  });

  if (!session) {
    return redirect("/login", { headers });
  }

  if (!username) {
    return redirect("/404", { headers });
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = Number(searchParams.get("page")) || 1;

  const { data: profiles } = await getProfileForUsername({
    dbClient: supabase,
    username,
  });

  const profile = profiles ? profiles[0] : null;

  if (!profile) {
    return redirect("/404", { headers });
  }

  // Obtener los gastos de este usuario
  const { data: expenses, limit, totalPages } = await getAllExpenses({
    dbClient: supabase,
    query: null,
    page,
    limit: 10,
  });

  // Filtrar los gastos por el usuario actual
  const userExpenses = expenses
    ? expenses.filter((e: any) => e.username === profile.username)
    : [];

  return json(
    {
      profile,
      sessionUserId: session.user.id,
      expenses: userExpenses,
      limit,
      totalPages,
    },
    { headers }
  );
};

export default function Profile() {
  const {
    profile: { avatar_url, name, username },
    expenses,
    totalPages,
  } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col w-full max-w-xl px-4 my-2">
      <Outlet />
      <div className="flex flex-col justify-center items-center m-4">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage alt="User avatar" src={avatar_url} />
        </Avatar>
        <h1 className="text-2xl font-bold">{name}</h1>
        <Link to={`https://github.com/${username}`}>
          <p className="text-zinc-500">@{username}</p>
        </Link>
      </div>
      <br />
      <Separator />
      <br />
      <h2 className="text-xl font-heading font-semibold">{"User expenses"}</h2>
      <br />
      <MyGrid rowData={expenses} />
    </div>
  );
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const skipRevalidation =
    actionResult?.skipRevalidation &&
    actionResult?.skipRevalidation?.includes("/profile.$username");

  if (skipRevalidation) {
    return false;
  }

  return defaultShouldRevalidate;
}
