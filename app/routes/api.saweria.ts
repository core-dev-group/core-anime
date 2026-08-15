import type { ActionFunctionArgs } from "react-router";
import { saveDonation, type SaweriaDonation } from "../lib/donations.server";

function isValidDonationPayload(p: any): p is SaweriaDonation {
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.id === "string" && p.id.length > 0 &&
    typeof p.donator_name === "string" && p.donator_name.length > 0 &&
    typeof p.donator_email === "string" &&
    typeof p.amount_raw === "number" && p.amount_raw >= 0 &&
    typeof p.message === "string" &&
    typeof p.created_at === "string" && p.created_at.length > 0
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Proteksi: Cek token rahasia di query string
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const secret = process.env.SAWERIA_WEBHOOK_TOKEN;
  if (secret && token !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // (Jika Saweria kirim signature di masa depan: validasi juga di sini)

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const p = payload as Record<string, unknown>;

  if (p.type !== "donation") {
    return Response.json({ success: true, message: "Ignored event type" }, { status: 200 });
  }

  if (!isValidDonationPayload(p)) {
    return Response.json({ error: "Missing or invalid donation fields" }, { status: 400 });
  }

  const donation: SaweriaDonation = {
    id: p.id,
    donator_name: p.donator_name,
    donator_email: p.donator_email,
    amount_raw: p.amount_raw,
    message: p.message,
    created_at: p.created_at,
  };

  try {
    await saveDonation(donation);
    console.log(`[Saweria Webhook] Donasi diterima: ${donation.donator_name} - ${donation.amount_raw}`);
    return Response.json({ success: true, message: "Donation recorded" }, { status: 200 });
  } catch (error) {
    console.error("[Saweria Webhook] Error saving donation:", error);
    return Response.json({ error: "Failed to save donation" }, { status: 500 });
  }
}
