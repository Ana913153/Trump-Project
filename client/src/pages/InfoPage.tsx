import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const defaults: Record<string, { title: string; body: string }> = {
  "/about": { title: "About Us", body: "Trump Account helps families organize long-term contribution plans with clear account information, transparent records, and direct administrator support." },
  "/contact": { title: "Contact Us", body: "For questions about your account, recurring contributions, or payment confirmation, contact the administrator through the email shown in your account footer." },
  "/tax-policy": { title: "Tax Policy", body: "Account holders are responsible for understanding their own tax obligations. Please consult a qualified tax professional for advice about contributions, transfers, and reporting requirements." },
  "/privacy": { title: "Privacy Policy", body: "We use account information only to provide account services, coordinate contributions, respond to support requests, and maintain secure records. We do not display private account details publicly." },
};

export default function InfoPage() {
  const [location] = useLocation();
  const content = trpc.content.public.useQuery();
  const custom: any = (content.data?.footerLinks || []).find((link: any) => link.url === location);
  const page: { title: string; body: string } = custom ? { title: custom.title, body: custom.body || defaults[location]?.body || "This information page is managed by the administrator." } : (defaults[location] || { title: "Information", body: "This information page is managed by the administrator." });
  return <div className="account-page info-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><ShieldCheck size={17} /></div><span>Trump Account</span></div><Link className="login-link" href="/"><ArrowLeft size={15} /> Back to account</Link></header><main className="info-page-main"><section className="info-page-card"><span className="section-overline">ACCOUNT INFORMATION</span><h1>{page.title}</h1><p>{page.body}</p><div className="info-page-contact"><Mail size={16} /> Need help? <Link href="/contact">Contact Us</Link></div><Link className="auth-submit info-back-button" href="/">Return to account <ArrowLeft size={15} /></Link></section></main></div>;
}
