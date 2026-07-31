import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import ConnectorsClient from "@/components/connectors/ConnectorsClient";

const VALID_STATUSES = ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"];
const VALID_NETWORK_TYPES = [
  "Shopkeeper", "Insurance Agent", "CA/Accountant", "Real Estate Broker", "Individual", "Other",
];

export default async function ConnectorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) redirect("/admin/login");

  const params = await searchParams;
  const search = params.search || "";
  const statusParam = params.status || "";
  const networkTypeParam = params.networkType || "";
  const cityParam = params.city || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;

  await dbConnect();

  const filter: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { mobile: { $regex: escaped, $options: "i" } },
      { connectorCode: { $regex: escaped, $options: "i" } },
    ];
  }

  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => VALID_STATUSES.includes(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (networkTypeParam) {
    const types = networkTypeParam.split(",").filter((t) => VALID_NETWORK_TYPES.includes(t));
    if (types.length) filter.networkType = { $in: types };
  }

  if (cityParam) {
    filter.city = { $regex: cityParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [connectors, total] = await Promise.all([
    Connector.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Connector.countDocuments(filter),
  ]);

  const initialData = {
    connectors: JSON.parse(JSON.stringify(connectors)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };

  const initialParams = {
    search,
    status: statusParam,
    networkType: networkTypeParam,
    city: cityParam,
    page: String(page),
  };

  return <ConnectorsClient initialData={initialData as never} initialParams={initialParams} role={ctx.role} />;
}
