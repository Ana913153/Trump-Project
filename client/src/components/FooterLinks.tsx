import { ExternalLink, ArrowUpRight } from "lucide-react";

export type FooterLinkItem = { id: number | string; title: string; url: string };

export default function FooterLinks({ links }: { links: FooterLinkItem[] }) {
  return <footer className="legal-footer"><div className="legal-footer-inner"><div className="legal-footer-heading"><span className="legal-footer-brand">Trump Account</span><span className="legal-footer-caption">Helpful information and account policies</span></div><nav className="legal-footer-links" aria-label="Information and legal links">{links.map((link, index) => { const external = link.url.startsWith("http"); return <a className={`legal-footer-button footer-tone-${index % 4}`} key={link.id} href={link.url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><span>{link.title}</span>{external ? <ExternalLink size={12} /> : <ArrowUpRight size={12} />}</a>; })}</nav></div></footer>;
}
