"use server";

import dbConnect from "@/lib/mongodb";
import { signOut } from "@/lib/auth";
import Activity from "@/models/Activity";

export async function handleSignOut() {
  const { auth: getSession } = await import("@/lib/auth");
  const session = await getSession();

  if (session?.user?.id) {
    await dbConnect();
    await Activity.create({
      actionType: "LOGOUT",
      performedBy: session.user.id,
      description: `Logout by ${session.user.email || session.user.name || "unknown"}`,
    });
  }

  await signOut();
}
