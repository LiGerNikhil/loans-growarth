import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";
import bcrypt from "bcryptjs";

const SEED_USERS = [
  {
    name: "Super Admin",
    email: "info@growarthcapita.com",
    password: "admin@123",
    role: "SUPER_ADMIN" as const,
  },
];

export async function seedSuperAdmin(): Promise<{ created: boolean; email: string }> {
  await dbConnect();

  for (const user of SEED_USERS) {
    const existing = await User.findOne({ email: user.email });
    if (existing) {
      return { created: false, email: user.email };
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    const createdUser = await User.create({
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      active: true,
    });

    await Activity.create({
      actionType: "USER_CREATED",
      description: `User created: ${user.email} (${user.role}) via seed`,
    }).catch(() => {});

    return { created: true, email: user.email };
  }

  return { created: false, email: "" };
}
