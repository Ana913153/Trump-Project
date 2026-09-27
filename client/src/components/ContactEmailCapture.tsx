import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { trpc } from "@/lib/trpc";

export default function ContactEmailCapture({ supportEmail, contactName, description }: { supportEmail: string; contactName: string; description?: string | null }) {
  const [emailInput, setEmailInput] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const submitMutation = trpc.content.contact.useMutation({
    onSuccess: () => {
      setEmailInput("");
      setStatus({ kind: "success", message: "Thanks. Your email has been sent to our support team." });
    },
    onError: () => setStatus({ kind: "error", message: "We couldn't submit your email. Please try again." }),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    setStatus(null);
    submitMutation.mutate({ email: normalizedEmail });
  };
  const intro = description?.trim() || `Enter your email and ${contactName} will follow up with you.`;
  const paragraphs = intro.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return <><div className="footer-contact-description">{paragraphs.map((paragraph, index) => <p key={`contact-description-${index}`}>{paragraph}</p>)}</div><form className="footer-contact-form" onSubmit={submit}><label className="field-label">Your email address<input type="email" autoComplete="email" maxLength={320} value={emailInput} onChange={(event) => { setEmailInput(event.target.value); setStatus(null); }} placeholder="you@example.com" required /></label><button className="auth-submit footer-contact-submit" type="submit" disabled={submitMutation.isPending}>{submitMutation.isPending ? "Submitting…" : "Submit email"}<ArrowUpRight size={15} /></button></form>{status && <p className={`footer-contact-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p>}<div className="footer-support-address"><span>Support email</span><a className="footer-contact-email" href={`mailto:${supportEmail}`}><Mail size={15} /> {supportEmail}</a></div></>;
}
