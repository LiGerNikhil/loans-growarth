import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { userSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "manage_users")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();

  const users = await User.find()
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "manage_users")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const body = await request.json();

  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
    role: parsed.data.role,
    active: parsed.data.active ?? true,
  });

  await Activity.create({
    actionType: "USER_CREATED",
    performedBy: ctx.userId,
    description: `User created: ${user.email} (${user.role}) by ${ctx.email}`,
  });

  return NextResponse.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: (user as any).createdAt,
  }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "manage_users")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const body = await request.json();

  if (!body._id) {
    return NextResponse.json({ error: "User _id is required" }, { status: 400 });
  }

  const user = await User.findById(body._id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: string[] = [];

  if (body.name !== undefined && body.name !== user.name) {
    user.name = body.name;
    updates.push("name");
  }

  if (body.email !== undefined) {
    const newEmail = body.email.toLowerCase();
    if (newEmail !== user.email) {
      const duplicate = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (duplicate) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      user.email = newEmail;
      updates.push("email");
    }
  }

  if (body.role !== undefined && body.role !== user.role) {
    const prevRole = user.role;
    user.role = body.role;
    updates.push("role");

    await Activity.create({
      actionType: "USER_ROLE_CHANGED",
      performedBy: ctx.userId,
      description: `User ${user.email} role changed from ${prevRole} to ${body.role} by ${ctx.email}`,
    });
  }

  if (body.password) {
    user.passwordHash = await bcrypt.hash(body.password, 12);
    updates.push("password");
  }

  if (body.active !== undefined && body.active !== user.active) {
    const wasActive = user.active;
    user.active = body.active;
    updates.push("active");

    if (!body.active) {
      await Activity.create({
        actionType: "USER_DEACTIVATED",
        performedBy: ctx.userId,
        description: `User ${user.email} deactivated by ${ctx.email}`,
      });
    } else {
      await Activity.create({
        actionType: "USER_ACTIVATED",
        performedBy: ctx.userId,
        description: `User ${user.email} reactivated by ${ctx.email}`,
      });
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No changes detected" }, { status: 400 });
  }

  await user.save();

  return NextResponse.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  });
}
