"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function toBigintId(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid id");
  return n;
}

export async function addTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const projectId = toBigintId(String(formData.get("projectId") || ""));
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title required");

  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    title,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const projectId = toBigintId(String(formData.get("projectId") || ""));
  const taskId = toBigintId(String(formData.get("taskId") || ""));
  const nextDone = String(formData.get("nextDone") || "") === "true";

  const { error } = await supabase
    .from("tasks")
    .update({ is_done: nextDone })
    .eq("id", taskId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const projectId = toBigintId(String(formData.get("projectId") || ""));
  const taskId = toBigintId(String(formData.get("taskId") || ""));

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}
