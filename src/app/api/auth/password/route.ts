import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";

export async function PATCH(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(ctx.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  await Activity.create({
    actionType: "PASSWORD_CHANGED",
    performedBy: user._id,
    description: `Password changed by ${user.email}`,
  });

  return NextResponse.json({ success: true });
}
