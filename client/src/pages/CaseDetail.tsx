import { ArrowLeft, ExternalLink, Mail, ShieldCheck } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

function mediaUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("/manus-storage/") || value.startsWith("/api/storage/") || /^https?:\/\//.test(value)) return value;
  return `/manus-storage/${value.replace(/^\/+/, "")}`;
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const content = trpc.content.public.useQuery(undefined, { retry: false });
  const article = (content.data?.articles || []).find((item: any) => String(item.id) === String(id));
  const paragraphs = article?.body?.split(/\n\s*\n/).map((item: string) => item.trim()).filter(Boolean) || [];

  if (content.isLoading) return <div className="account-page info-page"><main className="info-page-main"><section className="info-page-card"><span className="section-overline">COMMUNITY CASE</span><h1>Loading case…</h1></section></main></div>;
  if (!article) return <div className="account-page info-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><img src="/gold-eagle-initiative.png" alt="Gold Eagle Initiative" /></div><span>Gold Eagle Initiative</span></div><Link className="login-link" href="/donate"><ArrowLeft size={15} /> Back to cases</Link></header><main className="info-page-main"><section className="info-page-card"><span className="section-overline">COMMUNITY CASE</span><h1>Case not found</h1><p>This case may have been removed or is not available yet.</p><Link className="auth-submit info-back-button" href="/donate">Return to cases <ArrowLeft size={15} /></Link></section></main></div>;

  return <div className="account-page case-detail-page"><header className="site-header"><div className="site-brand"><div className="site-logo"><img src="/gold-eagle-initiative.png" alt="Gold Eagle Initiative" /></div><span>Gold Eagle Initiative</span></div><Link className="login-link" href="/donate"><ArrowLeft size={15} /> Back to cases</Link></header><main className="case-detail-main"><Link className="case-detail-back" href="/donate"><ArrowLeft size={14} /> Community case directory</Link><article className="case-detail-card"><div className="case-detail-meta"><span className="section-overline">{article.catalog || "COMMUNITY SUPPORT"}</span><span className="case-detail-id">Case #{article.id}</span></div><h1>{article.title}</h1>{article.imageUrl ? <img className="case-detail-image" src={mediaUrl(article.imageUrl)} alt={article.title} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}<div className="case-detail-body">{paragraphs.length ? paragraphs.map((paragraph: string, index: number) => <p key={`${article.id}-${index}`}>{paragraph}</p>) : <p>{article.body}</p>}</div>{article.linkUrl && /^https?:\/\//.test(article.linkUrl) && <a className="case-detail-external" href={article.linkUrl} target="_blank" rel="noreferrer">Open related resource <ExternalLink size={14} /></a>}<div className="case-detail-contact"><Mail size={16} /><span>Need help or want to support this project? <Link href="/contact">Contact Us</Link></span></div></article></main></div>;
}
