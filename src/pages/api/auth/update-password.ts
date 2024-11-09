import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const newPassword = formData.get("password") as string;

  if (!token || !newPassword) {
    return new Response("Token and new password are required", { status: 400 });
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    // Optionally, you can set a success message
    // For simplicity, we'll redirect to the sign-in page

    // Sign the user out after password change
  await supabase.auth.signOut();

    return redirect("/signin");
  } catch (error: any) {
    console.error("Password reset error:", error.message);
    return new Response(error.message, { status: 500 });
  }
};

export const GET: APIRoute = async ({ locals, cookies }) => {

    const accessToken = cookies.get("sb-access-token");

    if (!accessToken) {
    throw new Error("Access token not found");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const email = userData.user?.email;

  if (!email) {
    return new Response("Not authenticated", { status: 401 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: import.meta.env.DEV
      ? "http://localhost:4321/api/auth/update-password"
      : "https://astro-supabase-auth.vercel.app/api/auth/update-password",
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response("Password reset email sent", { status: 200 });
}; 