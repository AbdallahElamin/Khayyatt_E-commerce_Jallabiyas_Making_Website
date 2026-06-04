import { supabase } from "./supabase";

async function testInsert() {
  console.log("Starting test...");
  
  // 1. Login as an existing customer (or create one)
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: "customer@example.com",
    password: "password123",
  });
  
  let userId = authData.user?.id;
  
  if (authErr || !userId) {
    console.log("Login failed, trying to register:", authErr?.message);
    const { data: regData, error: regErr } = await supabase.auth.signUp({
      email: "customer@example.com",
      password: "password123",
    });
    if (regErr) {
      console.error("Register failed:", regErr);
      return;
    }
    userId = regData.user?.id;
    
    // insert profile
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        role: "customer",
        full_name: "Test Customer",
        username: "test_customer",
      });
    }
  }
  
  console.log("Logged in as user:", userId);

  // 2. Fetch a tailor
  const { data: tailors } = await supabase.from("profiles").select("id").eq("role", "tailor").limit(1);
  const tailorId = tailors?.[0]?.id;
  console.log("Found tailor:", tailorId);

  // 3. Try to insert order
  const orderId = `o-test-${Date.now()}`;
  console.log("Inserting order:", orderId);
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_id: userId,
    status: "pending_payment",
    total_price: 150,
  });

  if (orderError) {
    console.error("❌ Order Insert Error:", orderError);
    return;
  }
  console.log("✅ Order inserted successfully");

  // 4. Try to insert order_item
  const itemId = `item-test-${Date.now()}`;
  const { error: itemError } = await supabase.from("order_items").insert({
    id: itemId,
    order_id: orderId,
    tailor_id: tailorId,
    design: { fabric: "linen" },
    measurements: { chest: 100 },
    pricing: { total: 150 },
    stage: 0,
  });

  if (itemError) {
    console.error("❌ Order Item Insert Error:", itemError);
    return;
  }
  console.log("✅ Order item inserted successfully");
  
  // 5. Try to insert activity log
  const { error: logError } = await supabase.from("activity_logs").insert({
    order_item_id: itemId,
    stage: 0,
    note: "Test log",
  });
  
  if (logError) {
    console.error("❌ Activity Log Insert Error:", logError);
    return;
  }
  console.log("✅ Activity log inserted successfully");
}

testInsert().catch(console.error);
