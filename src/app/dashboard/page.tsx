import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllBlogs, getAllThemes } from "@/lib/database";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const blogs = getAllBlogs();
  const themes = getAllThemes();
  
  return (
    <DashboardClient 
      user={session.user}
      initialBlogs={blogs}
      initialThemes={themes}
    />
  );
}
