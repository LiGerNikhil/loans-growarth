import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import { getConnectorSession } from "@/lib/connect-auth";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";
import { SITE_URL } from "@/lib/seo";

export default async function ConnectorDashboardPage() {
  const session = await getConnectorSession();
  if (!session) redirect("/connect/login");

  await dbConnect();

  const connector = await Connector.findById(session.connectorId)
    .select("status name connectorCode email")
    .lean();

  if (!connector || connector.status !== "ACTIVE") {
    redirect("/connect/login");
  }

  return (
    <DashboardContent
      name={connector.name}
      connectorCode={connector.connectorCode}
      email={connector.email}
      referralLink={`${SITE_URL}/?ref=${connector.connectorCode}`}
    />
  );
}
