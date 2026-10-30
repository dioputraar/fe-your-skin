import { redirect } from "next/navigation";

// /auth sendiri tidak punya tampilan; arahkan ke halaman login.
export default function AuthIndexPage() {
  redirect("/auth/login");
}

