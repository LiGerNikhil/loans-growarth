"use server";

import dbConnect from "@/lib/mongodb";
import { connectorSignupSchema } from "@/lib/validation";
import Connector from "@/models/Connector";
import Activity from "@/models/Activity";
import { sendConnectorSignupNotifications } from "@/lib/notifications";
import { redirect } from "next/navigation";

export type SignupConnectorResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function signupConnector(
  _prev: SignupConnectorResult | null,
  formData: FormData
): Promise<SignupConnectorResult> {
  const raw = {
    name: formData.get("name") as string,
    mobile: formData.get("mobile") as string,
    email: formData.get("email") as string,
    city: formData.get("city") as string,
    networkType: formData.get("networkType") as string,
    bankAccountNumber: formData.get("bankAccountNumber") as string,
    bankIfsc: formData.get("bankIfsc") as string,
    bankAccountHolderName: formData.get("bankAccountHolderName") as string,
  };

  const parsed = connectorSignupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  await dbConnect();

  const existingByMobile = await Connector.findOne({ mobile: parsed.data.mobile }).select("_id").lean();
  if (existingByMobile) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: { mobile: ["This mobile number is already registered"] },
    };
  }

  const existingByEmail = await Connector.findOne({ email: parsed.data.email }).select("_id").lean();
  if (existingByEmail) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: { email: ["This email is already registered"] },
    };
  }

  const bankDetails: { accountNumber?: string; ifsc?: string; accountHolderName?: string } = {};
  if (parsed.data.bankAccountNumber) bankDetails.accountNumber = parsed.data.bankAccountNumber;
  if (parsed.data.bankIfsc) bankDetails.ifsc = parsed.data.bankIfsc;
  if (parsed.data.bankAccountHolderName) bankDetails.accountHolderName = parsed.data.bankAccountHolderName;

  const connector = await Connector.create({
    name: parsed.data.name,
    mobile: parsed.data.mobile,
    email: parsed.data.email,
    city: parsed.data.city,
    networkType: parsed.data.networkType,
    ...(Object.keys(bankDetails).length ? { bankDetails } : {}),
    status: "PENDING_APPROVAL",
  });

  await Activity.create({
    actionType: "CONNECTOR_SIGNUP",
    description: `Connector ${connector.connectorCode} signed up — ${parsed.data.name}, ${parsed.data.mobile}, ${parsed.data.email}, ${parsed.data.networkType}`,
  });

  try {
    await sendConnectorSignupNotifications({
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      email: parsed.data.email,
      city: parsed.data.city,
      networkType: parsed.data.networkType,
    });
  } catch {
    // silent — notification is best-effort
  }

  // Notify the connector that their application is under review
  try {
    const { sendConnectorSignupConfirmation } = await import("@/lib/notifications");
    await sendConnectorSignupConfirmation({ name: parsed.data.name, email: parsed.data.email });
  } catch {
    // best-effort
  }

  redirect("/connect/signup/confirmation");
}
