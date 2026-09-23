import { ArrowUpRight, ExternalLink, Mail, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export type FooterLinkItem = { id: number | string; title: string; url: string; body?: string | null };
export default function FooterLinks({ links }: { links: FooterLinkItem[] }) {
  const [contactOpen, setContactOpen] = useState(false);
  const content = trpc.content.public.useQuery(undefined, { retry: false, staleTime: 60_000 });
  const email = content.data?.settings?.contactEmail || "support@example.com";
  const name = content.data?.settings?.contactName || "Support Team";
  const isContactLink = (link: FooterLinkItem) => /contact/i.test(link.title) || /\/contact(?:$|[/?#])/i.test(link.url);
  return <>
    <footer className="legal-footer"><div className="legal-footer-inner"><div className="legal-footer-heading"><span className="legal-footer-brand">特朗普联盟金鹰计划</span><span className="legal-footer-caption">Helpful information and account policies</span></div><nav className="legal-footer-links" aria-label="Information and legal links">{links.map((link, index) => { const external = link.url.startsWith("http"); const contact = isContactLink(link); return contact ? <button className={`legal-footer-button footer-tone-${index % 4}`} key={link.id} type="button" onClick={() => setContactOpen(true)}><span>{link.title}</span><Mail size={12} /></button> : <a className={`legal-footer-button footer-tone-${index % 4}`} key={link.id} href={link.url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><span>{link.title}</span>{external ? <ExternalLink size={12} /> : <ArrowUpRight size={12} />}</a>; })}</nav></div></footer>
    {contactOpen && <div className="auth-backdrop" role="dialog" aria-modal="true" aria-label="Contact us" onClick={() => setContactOpen(false)}><div className="contact-modal footer-contact-modal" onClick={(event) => event.stopPropagation()}><button className="auth-close" type="button" onClick={() => setContactOpen(false)} aria-label="Close"><X size={18} /></button><div className="contact-mark"><Mail size={22} /></div><span className="auth-eyebrow">CONTACT US</span><h2>Contact us</h2><p>For help, questions, or account support, contact {name}.</p><a className="auth-submit footer-contact-email" href={`mailto:${email}`}><Mail size={15} /> {email}</a></div></div>}
  </>;
}
