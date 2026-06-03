import { supabase } from "./supabase";

async function run() {
  console.log("Signing up...");
  const { data, error } = await supabase.auth.signUp({
    email: "test_customer_" + Date.now() + "@example.com",
    password: "password123",
  });
  console.log("Signup returned:", { data, error });
  
  if (data?.user) {
    console.log("Inserting profile...");
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role: "customer",
      full_name: "Test Customer",
      username: "test_customer_" + Date.now(),
      location_lat: 0,
      location_lng: 0,
      location_address: "Test",
    });
    console.log("Insert returned error:", profileError);
  }
}

run().catch(console.error);
