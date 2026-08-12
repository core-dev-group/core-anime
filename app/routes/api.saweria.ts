import type { ActionFunctionArgs } from "react-router";
import { saveDonation, type SaweriaDonation } from "../lib/donations.server";

export async function action({ request }: ActionFunctionArgs) {
  // Hanya menerima metode POST
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // 1. Ambil Secret Token (Opsional, tapi disarankan)
    // Saweria mengirimkan header "saweria-webhook-signature"
    // Namun untuk tahap ini, kita abaikan dulu validasi signature demi kemudahan tes lokal.
    
    // 2. Baca body JSON
    const payload = await request.json();
    
    // 3. Pastikan tipe datanya adalah "donation"
    if (payload.type === "donation") {
      const donation: SaweriaDonation = {
        id: payload.id,
        donator_name: payload.donator_name,
        donator_email: payload.donator_email,
        amount_raw: payload.amount_raw,
        message: payload.message,
        created_at: payload.created_at,
      };

      // 4. Simpan ke database lokal kita
      saveDonation(donation);
      console.log(`[Saweria Webhook] Donasi diterima: ${donation.donator_name} - ${donation.amount_raw}`);
      
      return Response.json({ success: true, message: "Donation recorded" }, { status: 200 });
    } else {
      // Tipe event lain (misal: "vote", dsb) kita hiraukan
      return Response.json({ success: true, message: "Ignored event type" }, { status: 200 });
    }

  } catch (error) {
    console.error("[Saweria Webhook] Error processing webhook:", error);
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
}
