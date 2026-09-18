import { ExternalLink } from "lucide-react";

export type FooterLinkItem = { id: number | string; title: string; url: string };

export default function FooterLinks({ links }: { links: FooterLinkItem[] }) {
  return <footer className="legal-footer"><div className="legal-footer-inner"><span className="legal-footer-brand">Trump Account</span><nav className="legal-footer-links" aria-label="Information and legal links">{links.map((link) => <a key={link.id} href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel={link.url.startsWith("http") ? "noreferrer" : undefined}>{link.title}{link.url.startsWith("http") && <ExternalLink size={11} />}</a>)}</nav></div></footer>;
}
