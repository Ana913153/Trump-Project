import { useState } from "react";
import { toast } from "sonner";
import { Link2, Plus } from "lucide-react";

type FooterLink = { id: number | string; title: string; url: string; body?: string | null };
type Props = {
  footerLinks: FooterLink[];
  footerTitle: string;
  setFooterTitle: (value: string) => void;
  footerUrl: string;
  setFooterUrl: (value: string) => void;
  footerBody: string;
  setFooterBody: (value: string) => void;
  createFooterLinkMutation: any;
  updateFooterLinkMutation: any;
  deleteFooterLinkMutation: any;
};

export default function FooterLinksManager({ footerLinks, footerTitle, setFooterTitle, footerUrl, setFooterUrl, footerBody, setFooterBody, createFooterLinkMutation, updateFooterLinkMutation, deleteFooterLinkMutation }: Props) {
  const [editing, setEditing] = useState<FooterLink | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editBody, setEditBody] = useState("");
  const startEdit = (link: FooterLink) => { setEditing(link); setEditTitle(link.title); setEditUrl(link.url); setEditBody(link.body || ""); };
  const saveEdit = () => {
    if (!editing || !editTitle.trim() || !editUrl.trim() || !editBody.trim()) { toast.error("请填写标题、跳转地址和页面内容"); return; }
    updateFooterLinkMutation.mutate({ id: Number(editing.id), title: editTitle.trim(), url: editUrl.trim(), body: editBody.trim() }, { onSuccess: () => setEditing(null) });
  };
  const addLink = () => {
    if (!footerTitle.trim() || !footerUrl.trim() || !footerBody.trim()) { toast.error("请输入标题、跳转地址和页面内容"); return; }
    createFooterLinkMutation.mutate({ title: footerTitle.trim(), url: footerUrl.trim(), body: footerBody.trim() });
  };

  return <div className="content-card footer-links-admin-card"><div className="content-card-title"><div className="content-card-icon article"><Link2 size={19} /></div><div><h3>底部信息链接</h3><span>Home 和捐款页共享这些链接；可编辑标题、地址和页面正文。</span></div></div><div className="footer-links-admin-list">{footerLinks.length === 0 ? <span className="content-muted">暂无底部链接。</span> : footerLinks.map((link) => <div className="footer-link-admin-row" key={link.id}>{editing?.id === link.id ? <div className="content-add-form footer-link-edit-form"><input value={editTitle} maxLength={120} onChange={(event) => setEditTitle(event.target.value)} placeholder="链接标题，例如：About Us" /><input value={editUrl} maxLength={500} onChange={(event) => setEditUrl(event.target.value)} placeholder="跳转地址，例如：/about" /><textarea value={editBody} maxLength={10000} onChange={(event) => setEditBody(event.target.value)} placeholder="点击链接后显示的页面内容" rows={4} /><div className="footer-link-admin-actions"><button className="admin-primary" type="button" disabled={updateFooterLinkMutation.isPending} onClick={saveEdit}>{updateFooterLinkMutation.isPending ? "保存中…" : "保存修改"}</button><button className="faq-edit-button" type="button" onClick={() => setEditing(null)}>取消</button></div></div> : <><div><b>{link.title}</b><span>{link.url}</span><p className="footer-link-admin-body">{link.body || "暂无页面正文"}</p></div><div className="footer-link-admin-actions"><button className="faq-edit-button" type="button" onClick={() => startEdit(link)}>编辑</button><button className="faq-edit-button" type="button" onClick={() => { if (window.confirm("删除此底部链接？")) deleteFooterLinkMutation.mutate({ id: Number(link.id) }); }}>删除</button></div></>}</div>)}</div><div className="content-add-form"><input value={footerTitle} maxLength={120} onChange={(event) => setFooterTitle(event.target.value)} placeholder="例如：About Us" /><input value={footerUrl} maxLength={500} onChange={(event) => setFooterUrl(event.target.value)} placeholder="例如：/about 或 https://example.com" /><textarea value={footerBody} maxLength={10000} onChange={(event) => setFooterBody(event.target.value)} placeholder="点击链接后显示的页面内容" rows={4} /><button className="admin-primary" disabled={createFooterLinkMutation.isPending} onClick={addLink}><Plus size={15} /> {createFooterLinkMutation.isPending ? "保存中…" : "添加底部链接"}</button></div></div>;
}
