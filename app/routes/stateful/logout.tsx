import { useOutletContext, useNavigate } from "@remix-run/react";
import { Button } from "../../components/ui/button";
import type { SupabaseOutletContext } from "~/lib/supabase";

export function Logout() {
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return <Button onClick={handleSignOut}>Logout</Button>;
}
