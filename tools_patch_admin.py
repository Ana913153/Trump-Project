from pathlib import Path
p = Path('/home/ubuntu/kids-account-dashboard-replica/client/src/pages/Admin.tsx')
s = p.read_text()

s = s.replace(
'const [contactName, setContactName] = useState(""); const [currencyCode, setCurrencyCode] = useState("");',
'const [contactName, setContactName] = useState(""); const [currencyCode, setCurrencyCode] = useState(""); const [editingTransfer, setEditingTransfer] = useState<any | null>(null);'
)
s = s.replace(
'const setUserPasswordMutation = trpc.admin.setUserPassword.useMutation({ onSuccess: () => toast.success("用户密码已更新") });',
'const setUserPasswordMutation = trpc.admin.setUserPassword.useMutation({ onSuccess: () => toast.success("用户注册账户密码已同步更新") }); const updateBtcTransferMutation = trpc.admin.updateBtcTransfer.useMutation({ onSuccess: async () => { await btcTransfersQuery.refetch(); setEditingTransfer(null); toast.success("BTC 报备已保存"); } }); const deleteCurrencyMutation = trpc.admin.deleteCurrency.useMutation({ onSuccess: async () => { await contentQuery.refetch(); toast.success("加密货币类型已删除"); } }); const deleteFaqMutation = trpc.admin.deleteFaq.useMutation({ onSuccess: async () => { await contentQuery.refetch(); toast.success("FAQ 已删除"); } });'
)
s = s.replace(
'<div className="btc-transfer-admin-row" key={item.id}><div><b>{item.txHash}</b><span>{item.email || "未填写邮箱"} · {item.amount || "金额未填写"} · {new Date(item.createdAt).toLocaleString("zh-CN")}</span></div><select value={item.status} onChange={(event) => updateBtcTransferStatusMutation.mutate({ id: item.id, status: event.target.value as "pending" | "confirmed" | "rejected" })}>',
'<div className="btc-transfer-admin-row" key={item.id}>{editingTransfer?.id === item.id ? <div className="inline-action-card"><input value={editingTransfer.txHash} onChange={(event) => setEditingTransfer({ ...editingTransfer, txHash: event.target.value })} placeholder="交易哈希" /><input value={editingTransfer.amount || ""} onChange={(event) => setEditingTransfer({ ...editingTransfer, amount: event.target.value })} placeholder="金额" /><input value={editingTransfer.email || ""} onChange={(event) => setEditingTransfer({ ...editingTransfer, email: event.target.value })} placeholder="邮箱" /><button className="admin-primary" onClick={() => updateBtcTransferMutation.mutate({ id: item.id, txHash: editingTransfer.txHash, amount: editingTransfer.amount || undefined, email: editingTransfer.email || undefined, status: editingTransfer.status })}>保存报备</button><button onClick={() => setEditingTransfer(null)}>取消</button></div> : <><div><b>{item.txHash}</b><span>{item.email || "未填写邮箱"} · {item.amount || "金额未填写"} · {new Date(item.createdAt).toLocaleString("zh-CN")}</span></div><button onClick={() => setEditingTransfer({ ...item })}>编辑</button></>}<select value={item.status} onChange={(event) => updateBtcTransferStatusMutation.mutate({ id: item.id, status: event.target.value as "pending" | "confirmed" | "rejected" })}>'
)
s = s.replace(
'contactEmailValue={contactEmail} contactNameValue={contactName}',
'contactEmailValue={contactEmail} contactNameValue={contactName} deleteCurrencyMutation={deleteCurrencyMutation} deleteFaqMutation={deleteFaqMutation}'
)
s = s.replace(
'function ContentManagement({ settingsAddress, contactEmail, contactName, currencies,',
'function ContentManagement({ settingsAddress, contactEmail, contactName, currencies, deleteCurrencyMutation, deleteFaqMutation,'
)
s = s.replace(
'defaultCurrencyCode: currencyCode || "USD"',
'defaultCurrencyCode: currencyCode || "BTC"'
)
s = s.replace(
'currencies.map((item: any) => <option value={item.code} key={item.id}>{item.code} · {item.name} ({item.symbol})</option>)}</select></label><button',
'currencies.map((item: any) => <option value={item.code} key={item.id}>{item.code} · {item.name} ({item.symbol})</option>)}</select></label><div className="currency-admin-list">{currencies.map((item: any) => <div key={item.id}><span>{item.code} · {item.name} ({item.symbol})</span><button type="button" onClick={() => { if (window.confirm(`删除 ${item.code} 类型？`)) deleteCurrencyMutation.mutate({ id: item.id }); }}>删除</button></div>)}</div><button'
)
s = s.replace(
'<FaqEditor key={faq.id} faq={faq} index={index} onSave={(values: any) => updateFaqMutation.mutate({ id: faq.id, ...values })} />',
'<FaqEditor key={faq.id} faq={faq} index={index} onSave={(values: any) => updateFaqMutation.mutate({ id: faq.id, ...values })} onDelete={() => { if (window.confirm("确定删除这条 FAQ 吗？")) deleteFaqMutation.mutate({ id: faq.id }); }} />'
)
s = s.replace(
'function FaqEditor({ faq, index, onSave }: { faq: any; index: number; onSave: (values: { question: string; answer: string }) => void })',
'function FaqEditor({ faq, index, onSave, onDelete }: { faq: any; index: number; onSave: (values: { question: string; answer: string }) => void; onDelete: () => void })'
)
s = s.replace(
'<button className="faq-edit-button" onClick={() => setEditing(true)}>编辑问题和回答</button>',
'<button className="faq-edit-button" onClick={() => setEditing(true)}>编辑问题和回答</button><button className="faq-edit-button" onClick={onDelete}>删除 FAQ</button>'
)
p.write_text(s)
PY
python3 /home/ubuntu/kids-account-dashboard-replica/tools_patch_admin.py
rm /home/ubuntu/kids-account-dashboard-replica/tools_patch_admin.py
