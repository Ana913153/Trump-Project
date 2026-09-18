import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const defaults: Record<string, { title: string; body: string }> = {
  "/about": { title: "About Us", body: `Trump Account helps families organize long-term contribution plans with clear account information, transparent records, and direct administrator support.

Our purpose is to make family account activity easier to understand. Customers can review account balances, contribution plans, projected values, supported community projects, and payment records in one place.

We keep the account experience simple and practical: customers submit questions or payment confirmations, and the administrator reviews the information and updates the account record. Information shown in an account is intended to help with planning and record keeping.` },
  "/contact": { title: "Contact Us", body: `For questions about your account, recurring contributions, community projects, or payment confirmation, contact the administrator through the email shown in your account footer.

When contacting support, include the email address used for your account and a short description of the issue. For a payment question, include the payment method, transaction hash, amount, and date when available. Do not send passwords or private wallet keys.

The administrator will review your request and respond using the contact information associated with your account.` },
  "/tax-policy": { title: "Tax Policy", body: `Account holders are responsible for understanding and meeting their own tax obligations. The information shown in Trump Account is provided for account record keeping and general planning only; it is not tax, legal, or financial advice.

Contribution records, transfers, rewards, and other account activity may have different treatment depending on your location and personal circumstances. Please keep your account records and consult a qualified tax professional before preparing a tax return or making a reporting decision.

Trump Account does not determine a customer’s tax classification or file tax documents on a customer’s behalf.` },
  "/privacy": { title: "Privacy Policy", body: `We use account information only to provide account services, coordinate contributions, respond to support requests, and maintain secure records.

Information may include your name, email address, account activity, payment confirmations, and messages exchanged with the administrator. Access to private account information is limited to account functions and authorized administration.

We do not display private account details publicly. Please do not submit passwords, private wallet keys, or other sensitive credentials in a support message. If you believe your account information is incorrect or may have been exposed, contact the administrator promptly.` },
};

export default function InfoPage() {
  const [location] = useLocation();
  const content = trpc.content.public.useQuery();
  const custom: any = (content.data?.footerLinks || []).find((link: any) => link.url === location);
  const page: { title: string; body: string } = custom ? { title: custom.title, body: custom.body || defaults[location]?.body || "This information page is managed by the administrator." } : (defaults[location] || { title: "Information", body: "This information page is managed by the administrator." });
  const paragraphs = page.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return <div className="account-page info-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><ShieldCheck size={17} /></div><span>Trump Account</span></div><Link className="login-link" href="/"><ArrowLeft size={15} /> Back to account</Link></header><main className="info-page-main"><section className="info-page-card"><span className="section-overline">ACCOUNT INFORMATION</span><h1>{page.title}</h1><div className="info-page-body">{paragraphs.map((paragraph, index) => <p key={`${page.title}-${index}`}>{paragraph}</p>)}</div><div className="info-page-contact"><Mail size={16} /> Need help? <Link href="/contact">Contact Us</Link></div><Link className="auth-submit info-back-button" href="/">Return to account <ArrowLeft size={15} /></Link></section></main></div>;
}
