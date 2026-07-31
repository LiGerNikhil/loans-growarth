import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

const VALID_STATUSES = new Set([
  "NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING",
  "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED",
]);

const VALID_LOAN_TYPES = new Set([
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
]);

function escapeCSV(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(escapeCSV).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCSV(row[col])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "export_data")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const loanTypeParam = searchParams.get("loanType") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const assignedTo = searchParams.get("assignedTo") || "";

  await dbConnect();

  const filter: Record<string, unknown> = {};

  if (ctx.role === "AGENT") {
    filter.assignedTo = ctx.userId;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { mobile: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => VALID_STATUSES.has(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (loanTypeParam) {
    const types = loanTypeParam.split(",").filter((t) => VALID_LOAN_TYPES.has(t));
    if (types.length) filter.loanType = { $in: types };
  }

  if (dateFrom || dateTo) {
    const df: Record<string, Date> = {};
    if (dateFrom) df.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      df.$lte = end;
    }
    filter.createdAt = df;
  }

  if (assignedTo) filter.assignedTo = assignedTo;

  const leads = await Lead.find(filter)
    .populate("assignedTo", "name email")
    .populate("connectorId", "name connectorCode")
    .sort({ createdAt: -1 })
    .lean();

  const columns = ["Lead ID", "Name", "Mobile", "Email", "Salary", "Loan Amount", "Loan Type", "Status", "Assigned To", "Source", "Connector Name", "Connector Code", "Created"];

  if (format === "csv") {
    const rows = leads.map((l) => {
      const ll = l as any;
      return {
        "Lead ID": ll.leadId,
        Name: ll.name,
        Mobile: ll.mobile,
        Email: ll.email,
        Salary: ll.monthlySalary,
        "Loan Amount": ll.loanAmount,
        "Loan Type": ll.loanType,
        Status: ll.status,
        "Assigned To": ll.assignedTo?.name || "",
        Source: ll.source,
        "Connector Name": ll.connectorId?.name || "",
        "Connector Code": ll.connectorId?.connectorCode || "",
        Created: ll.createdAt ? new Date(ll.createdAt).toISOString().split("T")[0] : "",
      };
    });

    const csv = toCSV(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-export-${Date.now()}.csv"`,
      },
    });
  }

  // Excel
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = columns.map((c) => ({ header: c, key: c, width: 20 }));
  sheet.getRow(1).font = { bold: true };

  for (const l of leads) {
    const ll = l as any;
    sheet.addRow({
      "Lead ID": ll.leadId,
      Name: ll.name,
      Mobile: ll.mobile,
      Email: ll.email,
      Salary: ll.monthlySalary,
      "Loan Amount": ll.loanAmount,
      "Loan Type": ll.loanType,
      Status: ll.status,
      "Assigned To": ll.assignedTo?.name || "",
      Source: ll.source,
      "Connector Name": ll.connectorId?.name || "",
      "Connector Code": ll.connectorId?.connectorCode || "",
      Created: ll.createdAt ? new Date(ll.createdAt).toISOString().split("T")[0] : "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="leads-export-${Date.now()}.xlsx"`,
    },
  });
}
