import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 🔒 Pro gate (server-side)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return <p>Failed to load profile.</p>;
  }

  if ((profile?.plan ?? "free") !== "pro") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Projects</h1>
        <p>This feature is available on the Pro plan.</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </main>
    );
  }

  // ✅ Pro users continue
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Failed to load projects.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1>Projects</h1>

      {projects && projects.length > 0 ? (
        <ul style={{ display: "grid", gap: 8, paddingLeft: 18 }}>
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects yet.</p>
      )}
    </div>
  );
}

