import { CircleCheck, Mail, Target, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type ProjectProgress = { title: string; description: string; imageUrl?: string | null; targetAmountCents: number; raisedAmountCents: number; currencyCode: string; eyebrow?: string; sectionTitle?: string; milestonesLabel?: string; milestonesTitle?: string; peopleLabel?: string; peopleTitle?: string };
type Milestone = { id: number; title: string; description: string };
type Person = { id: number; name: string; role: string; bio: string; imageUrl?: string | null };
const fallbackProgress: ProjectProgress = { title: "Community Project Progress", description: "Follow the project's funding progress, practical milestones, and the people helping turn contributions into action.", targetAmountCents: 1000000, raisedAmountCents: 0, currencyCode: "USD", eyebrow: "Project Transparency", sectionTitle: "Community Project Progress", milestonesLabel: "Stage Outcomes", milestonesTitle: "Milestones", peopleLabel: "People", peopleTitle: "Project Team" };
function mediaUrl(value?: string | null) { if (!value) return ""; if (value.startsWith("/manus-storage/") || value.startsWith("/api/storage/") || /^https?:\/\//.test(value)) return value; return `/manus-storage/${value.replace(/^\/+/, "")}`; }
function paragraphs(value?: string | null) { return String(value || "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean); }
function formatAmount(cents: number, currencyCode: string) { try { return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(Math.max(0, cents) / 100); } catch { return `${currencyCode} ${(Math.max(0, cents) / 100).toLocaleString("en-US")}`; } }

export default function DonationProjectProgress() {
  const content = trpc.content.public.useQuery(undefined, { retry: false, refetchOnMount: "always" });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const progress = { ...fallbackProgress, ...(content.data?.projectProgress || {}) } as ProjectProgress;
  const milestones = (content.data?.milestones || []) as Milestone[];
  const people = (content.data?.people || []) as Person[];
  const percentage = progress.targetAmountCents > 0 ? Math.min(100, Math.round((progress.raisedAmountCents / progress.targetAmountCents) * 100)) : 0;

  return <>
    <section className="donation-project-progress" aria-labelledby="project-progress-title">
      <div className="project-progress-hero"><div className="project-progress-copy"><span className="section-overline">{progress.eyebrow}</span><h2 id="project-progress-title">{progress.sectionTitle || progress.title}</h2>{paragraphs(progress.description).map((paragraph, index) => <p key={`progress-${index}`}>{paragraph}</p>)}</div>{progress.imageUrl && <img src={mediaUrl(progress.imageUrl)} alt={progress.sectionTitle || progress.title} className="project-progress-image" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</div>
      <div className="project-funding-card"><div className="project-funding-heading"><span><Target size={17} /> Funding progress</span><strong>{percentage}%</strong></div><div className="project-progress-track" aria-label={`${percentage}% funded`}><span style={{ width: `${percentage}%` }} /></div><div className="project-funding-numbers"><div><small>Raised</small><b>{formatAmount(progress.raisedAmountCents, progress.currencyCode)}</b></div><div><small>Goal</small><b>{formatAmount(progress.targetAmountCents, progress.currencyCode)}</b></div></div></div>
      <div className="project-detail-grid">
        <div className="project-detail-card"><div className="project-detail-heading"><CircleCheck size={18} /><div><span className="section-overline">{progress.milestonesLabel}</span><h3>{progress.milestonesTitle}</h3></div></div>{milestones.length > 0 ? <ol className="project-milestone-list">{milestones.map((milestone) => <li key={milestone.id}><b>{milestone.title}</b>{paragraphs(milestone.description).map((paragraph, index) => <p key={`${milestone.id}-${index}`}>{paragraph}</p>)}</li>)}</ol> : <p className="project-detail-empty">Stage outcomes have not been published yet. Published project milestones will appear here.</p>}</div>
        <div className="project-detail-card"><div className="project-detail-heading"><UsersRound size={18} /><div><span className="section-overline">{progress.peopleLabel}</span><h3>{progress.peopleTitle}</h3></div></div>{people.length > 0 ? <div className="project-people-list">{people.map((person) => <article className="project-person" key={person.id}>{person.imageUrl ? <img src={mediaUrl(person.imageUrl)} alt={person.name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="project-person-placeholder">{person.name.slice(0, 1).toUpperCase()}</span>}<div><b>{person.name}</b><small>{person.role}</small><p>{paragraphs(person.bio)[0] || person.bio}</p><button type="button" className="project-person-more" onClick={() => setSelectedPerson(person)}>View details</button></div></article>)}</div> : <p className="project-detail-empty">Team profiles and photos have not been published yet. Published team details will appear here.</p>}</div>
      </div>
    </section>
    {selectedPerson && <div className="person-detail-backdrop" role="dialog" aria-modal="true" aria-label={selectedPerson.name} onClick={() => setSelectedPerson(null)}><div className="person-detail-modal" onClick={(event) => event.stopPropagation()}><button className="person-detail-close" type="button" onClick={() => setSelectedPerson(null)} aria-label="Close"><X size={18} /></button>{selectedPerson.imageUrl ? <img className="person-detail-image" src={mediaUrl(selectedPerson.imageUrl)} alt={selectedPerson.name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="person-detail-placeholder">{selectedPerson.name.slice(0, 1).toUpperCase()}</div>}<span className="section-overline">{selectedPerson.role}</span><h3>{selectedPerson.name}</h3><div className="person-detail-bio">{paragraphs(selectedPerson.bio).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Link href="/contact" className="person-detail-contact" onClick={() => setSelectedPerson(null)}><Mail size={14} /> Contact support team</Link></div></div>}
  </>;
}
