import { seedSuperAdmin } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedSuperAdmin();
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: "Seed failed", details: (err as Error).message }, { status: 500 });
  }
}
