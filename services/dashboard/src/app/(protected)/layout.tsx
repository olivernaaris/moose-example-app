import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const apiUrl = process.env.API_URL ?? "http://localhost:3001";

  const res = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const session = await res.json().catch(() => null);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
