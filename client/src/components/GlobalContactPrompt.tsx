import { Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const contactPattern = /(contact|联系我们|联系支持)/i;
export default function GlobalContactPrompt() {
  const [open, setOpen] = useState(false);
  const content = trpc.content.public.useQuery(undefined, { retry: false, staleTime: 60_000 });
  const email = content.data?.settings?.contactEmail || "support@example.com";
  const name = content.data?.settings?.contactName || "Support Team";
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.closest("a,button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!control) return;
      const href = control instanceof HTMLAnchorElement ? control.getAttribute("href") || "" : "";
      const label = `${control.textContent || ""} ${control.getAttribute("aria-label") || ""} ${href}`;
      if (!contactPattern.test(label)) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return open ? <div className="auth-backdrop global-contact-backdrop" role="dialog" aria-modal="true" aria-label="Contact us" onClick={() => setOpen(false)}><div className="contact-modal global-contact-modal" onClick={(event) => event.stopPropagation()}><button className="auth-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button><div className="contact-mark"><Mail size={22} /></div><span className="auth-eyebrow">CONTACT US</span><h2>Contact us</h2><p>For help, questions, or account support, contact {name}.</p><a className="auth-submit footer-contact-email" href={`mailto:${email}`}><Mail size={15} /> {email}</a></div></div> : null;
}
