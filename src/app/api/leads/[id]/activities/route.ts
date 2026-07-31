import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const lead = await Lead.findById(id).select("assignedTo").lean();
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (ctx.role === "AGENT" && lead.assignedTo?.toString() !== ctx.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const activities = await Activity.find({ leadId: id })
    .populate("performedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(activities);
}
