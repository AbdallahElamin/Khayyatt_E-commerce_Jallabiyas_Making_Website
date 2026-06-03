import { supabase } from "./supabase";

async function check() {
  const { data: users, error: authError } = await supabase.auth.admin?.listUsers() || { data: null, error: null };
  console.log("Users in Auth:", users ? users.users.length : "Needs admin key");

  const { data: profiles, error: profError } = await supabase.from("profiles").select("*");
  console.log("Profiles Error:", profError);
  console.log("Profiles count:", profiles?.length);
  if (profiles) {
    profiles.forEach(p => console.log(p.id, p.full_name, p.username));
  }
}

check().catch(console.error);
