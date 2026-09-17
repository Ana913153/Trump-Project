import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, KeyRound, LockKeyhole, Sparkles } from "lucide-react";

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const resetMutation = trpc.auth.resetPassword.useMutation();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await resetMutation.mutateAsync({ token, password }); toast.success("Password reset. Return to sign in."); setTimeout(() => { window.location.href = "/"; }, 700); } catch (error: any) { toast.error(error?.message || "The reset link is invalid or expired"); }
  };
  return <div className="reset-page"><div className="reset-card"><div className="admin-brand"><div className="site-logo"><Sparkles size={17} /></div><span>nest<span className="brand-dot">.</span></span></div><div className="admin-login-icon"><KeyRound size={23} /></div><span className="auth-eyebrow">PASSWORD RESET</span><h1>New password</h1><p> 8 , New password.</p>{token ? <form onSubmit={submit} className="auth-form"><label className="field-label">New password<div className="password-input"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label><button className="auth-submit" disabled={resetMutation.isPending} type="submit">{resetMutation.isPending ? "Saving…" : "Save new password"}<ArrowUpRight size={16} /></button></form> : <div className="reset-invalid"><LockKeyhole size={19} /><span>The reset token is missing. Open a valid reset link.</span></div>}<button className="back-link" onClick={() => { window.location.href = "/"; }}><ArrowLeft size={14} /> Back to account</button></div></div>;
}
