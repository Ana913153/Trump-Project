import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

const pages: Record<string, { eyebrow: string; title: string; body: string }> = {
  "/about": { eyebrow: "ABOUT TRUMP ACCOUNT", title: "About Us", body: "Trump Account helps families organize long-term contribution plans with clear account information, transparent records, and direct administrator support." },
  "/contact": { eyebrow: "CONTACT TRUMP ACCOUNT", title: "Contact Us", body: "For questions about your account, recurring contributions, or payment confirmation, contact the administrator through the email shown in your account footer." },
  "/tax-policy": { eyebrow: "ACCOUNT INFORMATION", title: "Tax Policy", body: "Account holders are responsible for understanding their own tax obligations. Please consult a qualified tax professional for advice about contributions, transfers, and reporting requirements." },
  "/privacy": { eyebrow: "ACCOUNT INFORMATION", title: "Privacy Policy", body: "We use account information only to provide account services, coordinate contributions, respond to support requests, and maintain secure records. We do not display private account details publicly." },
};

export default function InfoPage() {
  const [location] = useLocation();
  const page = pages[location] || pages["/about"];
  return <div className="account-page info-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><ShieldCheck size={17} /></div><span>Trump Account</span></div><Link className="login-link" href="/"><ArrowLeft size={15} /> Back to account</Link></header><main className="info-page-main"><section className="info-page-card"><span className="section-overline">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.body}</p><div className="info-page-contact"><Mail size={16} /> Need help? <Link href="/contact">Contact Us</Link></div><Link className="auth-submit info-back-button" href="/">Return to account <ArrowLeft size={15} /></Link></section></main></div>;
}
