import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { getReports } from "@/lib/reports";

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
  const type = searchParams.get("type") || "daily-leads";
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const networkType = searchParams.get("networkType") || undefined;

  const data = await getReports(ctx.role, ctx.userId, dateFrom, dateTo, networkType);

  let rows: Record<string, unknown>[] = [];
  let columns: string[] = [];
  let sheetName = "Report";

  switch (type) {
    case "daily-leads": {
      sheetName = "Daily Leads";
      columns = ["Date", "Leads"];
      rows = data.dailyLeads.map((r) => ({ Date: r.date, Leads: r.count }));
      break;
    }
    case "monthly-leads": {
      sheetName = "Monthly Leads";
      columns = ["Month", "Leads"];
      rows = data.monthlyLeads.map((r) => ({ Month: r.month, Leads: r.count }));
      break;
    }
    case "agent-performance": {
      sheetName = "Agent Performance";
      columns = ["Agent", "Total Leads", "Approved", "Rejected", "Pending"];
      rows = data.agentPerformance.map((r) => ({
        Agent: r.name,
        "Total Leads": r.total,
        Approved: r.approved,
        Rejected: r.rejected,
        Pending: r.pending,
      }));
      break;
    }
    case "loan-type": {
      sheetName = "Loan Type";
      columns = ["Loan Type", "Count", "Total Amount"];
      rows = data.loanType.map((r) => ({
        "Loan Type": r.name,
        Count: r.count,
        "Total Amount": r.totalAmount,
      }));
      break;
    }
    case "conversion": {
      sheetName = "Conversion";
      columns = ["Status", "Count"];
      rows = data.conversion.map((r) => ({
        Status: r.status,
        Count: r.count,
      }));
      break;
    }
    case "connector-performance": {
      sheetName = "Connector Performance";
      columns = ["Connector", "Code", "Network Type", "Leads Referred", "Approved", "Conversion Rate", "Commission Accrued", "Commission Paid"];
      rows = data.connectorPerformance.map((r) => ({
        Connector: r.name,
        Code: r.connectorCode,
        "Network Type": r.networkType,
        "Leads Referred": r.totalLeads,
        Approved: r.approvedLeads,
        "Conversion Rate": `${r.totalLeads > 0 ? Math.round((r.approvedLeads / r.totalLeads) * 100) : 0}%`,
        "Commission Accrued": r.totalAccrued,
        "Commission Paid": r.totalPaid,
      }));
      break;
    }
  }

  if (format === "csv") {
    const csv = toCSV(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${sheetName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv"`,
      },
    });
  }

  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c, key: c, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${sheetName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.xlsx"`,
    },
  });
}
