import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy, ExternalLink, Mail, ShieldCheck, WalletCards } from "lucide-react";
import { trpc } from "@/lib/trpc";
import FooterLinks, { type FooterLinkItem } from "@/components/FooterLinks";

const fallbackDonation = { title: "Support a community project", body: "Help fund a practical community project with a transparent payment record and a direct contact channel.", imageUrl: null as string | null };
const fallbackCases = [
  { id: "fallback-1", catalog: "Environment", title: "Community gardens", body: "Help create more shared green spaces for local families.", imageUrl: null, linkUrl: "/donate" },
  { id: "fallback-2", catalog: "Education", title: "Youth learning", body: "Support learning resources and after-school opportunities.", imageUrl: null, linkUrl: "/donate" },
  { id: "fallback-3", catalog: "Family support", title: "Family assistance", body: "Contribute to practical support for families in need.", imageUrl: null, linkUrl: "/donate" },
  { id: "fallback-4", catalog: "Community", title: "Local action", body: "Back community-led projects with a clear public purpose.", imageUrl: null, linkUrl: "/donate" },
  { id: "fallback-5", catalog: "Public benefit", title: "Shared resources", body: "Help make useful community resources easier to access.", imageUrl: null, linkUrl: "/donate" },
];

type CaseItem = { id: number | string; catalog?: string | null; title: string; body: string; imageUrl?: string | null; linkUrl?: string | null };

export default function Donation() {
  const content = trpc.content.public.useQuery(undefined, { retry: false, refetchOnMount: "always", refetchOnWindowFocus: true });
  const donation = content.data?.donation || fallbackDonation; const footerLinks = ((content.data as any)?.footerLinks || []) as FooterLinkItem[];
  const sourceCases = useMemo(() => { const live = (content.data?.articles || []) as CaseItem[]; return live.length ? live : fallbackCases; }, [content.data?.articles]);
  const cases = sourceCases;
  const address = content.data?.settings?.usdcAddress || "0x0000000000000000000000000000000000000000";
  const email = content.data?.settings?.contactEmail || "support@example.com";
  const [amount, setAmount] = useState("50");
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const selectedAmount = amount === "custom" ? customAmount : amount;
  const copyAddress = async () => { try { await navigator.clipboard.writeText(address); setCopied(true); toast.success("USDC address copied."); window.setTimeout(() => setCopied(false), 1800); } catch { toast.error("Copy failed. Please copy the address manually."); } };
  const submitDonation = () => { if (!selectedAmount || Number(selectedAmount) <= 0) { toast.error("Enter a valid contribution amount."); return; } setShowPayment(true); window.setTimeout(() => document.getElementById("usdc-payment")?.scrollIntoView({ behavior: "smooth", block: "center" }), 20); };
  const openCase = (linkUrl: string) => { if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) window.open(linkUrl, "_blank", "noopener,noreferrer"); else window.location.href = linkUrl; };
  return <div className="account-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><WalletCards size={17} /></div><span>Trump Account</span></div><Link className="login-link" href="/"><ArrowLeft size={15} /> Back to account</Link></header><main className="app-main donation-page"><div className="account-topline"><div><div className="page-overline">USDC COMMUNITY SUPPORT</div></div></div><section className="donation-editorial"><h1>{donation.title}</h1><div className="donation-hero-image">{donation.imageUrl ? <img src={donation.imageUrl} alt="" /> : <div className="article-illustration"><span>support.</span><b>○</b></div>}</div><p>{donation.body}</p></section><section className="donation-panel" id="usdc-payment"><div className="btc-mark"><WalletCards size={25} /></div><span className="auth-eyebrow">USDC PAYMENT</span><h2>Choose your contribution</h2><div className="donation-amounts">{["20", "50", "100", "custom"].map((value) => <button type="button" className={amount === value ? "active" : ""} key={value} onClick={() => setAmount(value)}>{value === "custom" ? "More" : `$${value}`}</button>)}</div>{amount === "custom" && <label className="field-label">Custom amount (USD)<input type="number" min="1" step="0.01" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="Enter amount" /></label>}<button className="auth-submit donate-now-button" onClick={submitDonation}>Donate now <WalletCards size={15} /></button>{showPayment && <div className="payment-reveal"><div className="btc-warning"><ShieldCheck size={15} /> USDC only · confirm the correct network before sending</div><div className="btc-address-box"><span>{address}</span><button onClick={copyAddress} aria-label="Copy USDC address">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div><button className="auth-submit" onClick={() => { setPaid(true); toast.success("Payment marked as completed."); }}>{paid ? "Payment marked as completed" : `I have paid $${selectedAmount}`}<Check size={15} /></button>{paid && <a className="btc-contact" href={`mailto:${email}`}><Mail size={15} /> Contact administrator: {email}</a>}</div>}<div className="btc-hash-note"><ShieldCheck size={13} /> Keep your payment record and contact email for confirmation.</div></section><section className="donation-cases"><div className="section-title-row"><div><span className="section-overline">Community case directory</span><h2>Explore supported projects</h2></div><span className="section-note">{cases.length} stories</span></div><div className="donation-case-grid">{cases.map((item) => <article className="donation-case-card" key={item.id}><div className="case-catalog case-catalog-top">{item.catalog || "Community"}</div><button className="donation-case-image-button" type="button" onClick={() => openCase(item.linkUrl || "/donate")} aria-label={`Open ${item.title}`}><div className="donation-case-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className="carousel-placeholder"><span>community.</span><b>○</b></div>}<span className="case-open-badge"><ExternalLink size={14} /></span></div></button><div className="donation-case-copy"><h3>{item.title}</h3><p>{item.body}</p><button type="button" onClick={() => openCase(item.linkUrl || "/donate")}>View case <ExternalLink size={13} /></button></div></article>)}</div></section></main><FooterLinks links={footerLinks} /></div>;
}
