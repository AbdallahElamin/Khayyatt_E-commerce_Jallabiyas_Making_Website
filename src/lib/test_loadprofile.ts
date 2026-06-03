import { supabase } from "./supabase";

async function run() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .single();

  console.log("Data:", data);
  console.log("Error:", error);
}

run();
