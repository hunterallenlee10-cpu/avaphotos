"use server";

import { BRAND } from "@/content/site";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<Field, string>>; values?: Partial<Record<Field, string>> };

type Field = "name" | "email" | "occasion" | "date" | "team" | "message";

const LIMITS: Record<Field, number> = { name: 120, email: 200, occasion: 80, date: 40, team: 160, message: 4000 };

/**
 * Booking form handler. Delivery provider is chosen by env vars:
 *   RESEND_API_KEY (+ optional CONTACT_FROM, CONTACT_TO)  → Resend
 *   FORMSPREE_ENDPOINT                                     → Formspree
 * With neither set, submissions are logged in development and rejected in
 * production so nothing is silently lost. See .env.example.
 */
export async function sendBooking(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot — real people never fill this in.
  if (String(form.get("company") ?? "").trim()) return { status: "success" };

  const values = Object.fromEntries(
    (Object.keys(LIMITS) as Field[]).map((k) => [k, String(form.get(k) ?? "").trim().slice(0, LIMITS[k])]),
  ) as Record<Field, string>;

  const fieldErrors: Partial<Record<Field, string>> = {};
  if (!values.name) fieldErrors.name = "Who should I reply to?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) fieldErrors.email = "That email doesn’t look right.";
  if (!values.occasion) fieldErrors.occasion = "Pick the closest fit.";
  if (values.message.length < 10) fieldErrors.message = "Give me a little more to go on.";
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "A couple of things need a look.", fieldErrors, values };
  }

  const subject = `Booking: ${values.occasion}${values.team ? ` — ${values.team}` : ""}`;
  const text = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Sport / occasion: ${values.occasion}`,
    `Date: ${values.date || "—"}`,
    `Team / school: ${values.team || "—"}`,
    "",
    values.message,
  ].join("\n");

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM ?? "Booking form <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO ?? BRAND.email],
          reply_to: values.email,
          subject,
          text,
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    } else if (process.env.FORMSPREE_ENDPOINT) {
      const res = await fetch(process.env.FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, _subject: subject, _replyto: values.email }),
      });
      if (!res.ok) throw new Error(`Formspree ${res.status}`);
    } else if (process.env.NODE_ENV !== "production") {
      console.info("[contact] No provider configured — would send:\n" + subject + "\n" + text);
    } else {
      throw new Error("No contact provider configured (set RESEND_API_KEY or FORMSPREE_ENDPOINT)");
    }
  } catch (err) {
    console.error("[contact] send failed", err);
    return { status: "error", message: "send-failed", values };
  }

  return { status: "success" };
}
