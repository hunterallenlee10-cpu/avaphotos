"use client";

import { useActionState, useEffect, useRef, useSyncExternalStore } from "react";
import { sendBooking, type ContactState } from "@/app/contact/actions";
import { BRAND, CONTACT } from "@/content/site";
import { Txt } from "@/components/ui";

const initial: ContactState = { status: "idle" };
const noopSubscribe = () => () => {};

export function BookingForm() {
  const [state, action, pending] = useActionState(sendBooking, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Prefill from /contact?for=… (Services page buttons) without making the page dynamic.
  const forParam = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("for"),
    () => null,
  );
  const prefill = forParam && CONTACT.occasions.includes(forParam) ? forParam : "";
  useEffect(() => {
    if (!prefill) return;
    const radio = formRef.current?.querySelector<HTMLInputElement>(`input[name="occasion"][value="${CSS.escape(prefill)}"]`);
    if (radio) radio.checked = true;
  }, [prefill]);

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    } else if (state.status !== "idle") {
      statusRef.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="relative overflow-hidden border border-line p-8 outline-none md:p-12">
        <p className="label text-mute">Final</p>
        <p className="scoreboard scoreboard-dots mt-4 text-[clamp(5rem,12vw,9rem)]">1–0</p>
        <h2 className="display mt-6 text-[clamp(3.4rem,7vw,6rem)]">{CONTACT.success.title}</h2>
        <p className="mt-4 max-w-[40ch] text-lg text-paper/85"><Txt>{CONTACT.success.body}</Txt></p>
      </div>
    );
  }

  const err = state.status === "error" ? state : null;
  const fe = err?.fieldErrors ?? {};
  const v = err?.values ?? {};
  const sendFailed = err?.message === "send-failed";

  return (
    <form ref={formRef} action={action} noValidate className="space-y-10">
      {err && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border-l-2 border-amber bg-ink-2 px-5 py-4 outline-none">
          {sendFailed ? (
            <>
              <p className="display text-3xl">{CONTACT.error.title}</p>
              <p className="mt-2 text-paper/85">
                {CONTACT.error.body}{" "}
                <a href={`mailto:${BRAND.email}`} className="u-link text-amber">{BRAND.email}</a>.
              </p>
            </>
          ) : (
            <p className="text-paper/90">{err.message}</p>
          )}
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-2">
        <Field name="name" label="Your name" autoComplete="name" required error={fe.name} defaultValue={v.name} />
        <Field name="email" label="Email" type="email" autoComplete="email" inputMode="email" required error={fe.email} defaultValue={v.email} />
      </div>

      <fieldset aria-describedby={fe.occasion ? "occasion-error" : undefined}>
        <legend className="label mb-4 text-mute">
          Sport or occasion <span aria-hidden="true" className="text-amber">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT.occasions.map((o) => (
            <label key={o} className="relative cursor-pointer">
              <input
                type="radio"
                name="occasion"
                value={o}
                // defaultChecked (not controlled) so React's post-action form reset
                // restores the submitted choice instead of clearing it
                defaultChecked={(v.occasion || prefill) === o}
                className="peer absolute inset-0 cursor-pointer opacity-0"
              />
              <span className="inline-flex min-h-11 items-center border border-paper/30 px-4 text-sm transition-colors duration-300 peer-checked:border-amber peer-checked:bg-amber peer-checked:text-ink peer-hover:border-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber">
                {o}
              </span>
            </label>
          ))}
        </div>
        {fe.occasion && <p id="occasion-error" className="mt-2 text-sm text-amber">{fe.occasion}</p>}
      </fieldset>

      <div className="grid gap-10 md:grid-cols-2">
        <Field name="date" label="Date (or season)" type="text" placeholder="e.g. Sat, Oct 18 — or spring season" defaultValue={v.date} />
        <Field name="team" label="Team or school" autoComplete="organization" defaultValue={v.team} />
      </div>

      <Field
        name="message"
        label="Tell me about it"
        textarea
        required
        error={fe.message}
        defaultValue={v.message}
        placeholder="Who’s playing, what you want to remember, anything I should know."
      />

      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex min-h-14 items-center gap-3 bg-amber px-7 font-semibold text-ink transition-colors duration-500 hover:bg-paper disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send it"}
          <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </button>
        <p className="text-sm text-mute">
          <span aria-hidden="true" className="text-amber">*</span> required
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  textarea,
  required,
  ...rest
}: {
  name: string;
  label: string;
  error?: string;
  textarea?: boolean;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = `f-${name}`;
  const cls =
    "peer mt-2 block w-full border-0 border-b border-paper/30 bg-transparent px-0 py-3 text-lg text-paper placeholder:text-paper/35 transition-colors duration-300 focus:border-amber focus:outline-none focus:ring-0 aria-[invalid=true]:border-amber";
  const common = {
    id,
    name,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div>
      <label htmlFor={id} className="label text-mute">
        {label} {required && <span aria-hidden="true" className="text-amber">*</span>}
      </label>
      {textarea ? (
        <textarea {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} {...common} rows={5} className={`${cls} resize-y`} />
      ) : (
        <input type="text" {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} {...common} className={cls} />
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-amber">
          {error}
        </p>
      )}
    </div>
  );
}
