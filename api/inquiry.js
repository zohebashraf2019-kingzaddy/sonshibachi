// Vercel serverless function: emails event / catering inquiries to Son's Hibachi via Resend.
// Required env vars (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY      – from resend.com
//   INQUIRY_TO_EMAIL    – where inquiries go (the owners' email)
//   INQUIRY_FROM_EMAIL  – verified sender, e.g. "Son's Hibachi Website <inquiries@yourdomain.com>"
//                          (defaults to Resend's test sender onboarding@resend.dev)

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n = 500) => String(s || "").trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }

  // Honeypot: bots fill hidden "company" field — pretend success.
  if (body.company) return res.status(200).json({ ok: true });

  const d = {
    name: clip(body.name, 120), phone: clip(body.phone, 40), email: clip(body.email, 160),
    inquiryType: clip(body.inquiryType, 80), date: clip(body.date, 20), time: clip(body.time, 20),
    guests: clip(body.guests, 10), location: clip(body.location, 240), menu: clip(body.menu, 300), message: clip(body.message, 2000),
  };
  if (!d.name || !d.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    return res.status(400).json({ ok: false, error: "Name, phone and a valid email are required." });
  }

  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL) {
    console.error("Inquiry email not configured: set RESEND_API_KEY and INQUIRY_TO_EMAIL");
    return res.status(500).json({ ok: false, error: "Email not configured" });
  }

  const rows = [
    ["Name", d.name], ["Phone", d.phone], ["Email", d.email], ["Inquiry", d.inquiryType],
    ["Date", d.date || "TBD"], ["Start time", d.time || "TBD"], ["Guests", d.guests || "?"],
    ["Location", d.location || "?"], ["Menu ideas", d.menu || "-"],
  ];
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0b0a0e;color:#f6efe6;border-radius:14px;overflow:hidden">
    <div style="background:#ff3f9e;padding:18px 22px;font-size:20px;font-weight:bold">🔥 New ${esc(d.inquiryType || "event")} inquiry</div>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td style="padding:10px 22px;color:#d1a55a;width:140px;border-bottom:1px solid #222">${k}</td><td style="padding:10px 22px;border-bottom:1px solid #222">${esc(v)}</td></tr>`).join("")}
    </table>
    <div style="padding:18px 22px;white-space:pre-wrap;font-size:15px">${esc(d.message || "(no extra message)")}</div>
    <div style="padding:14px 22px;font-size:12px;color:#999">Sent from the Son's Hibachi website. Reply to this email to respond to ${esc(d.name)}.</div>
  </div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${d.message}`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: INQUIRY_FROM_EMAIL || "Son's Hibachi Website <onboarding@resend.dev>",
        to: INQUIRY_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: d.email,
        subject: `New inquiry: ${d.inquiryType || "Event"}${d.date ? " on " + d.date : ""} (${d.name})`,
        html, text,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Email provider error" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
