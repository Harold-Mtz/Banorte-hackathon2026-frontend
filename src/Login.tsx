import { FormEvent, useState } from 'react';
import { login, AuthSession } from './api';
import banorteLogo from './public/banorte.png';

export function Login({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError('');
    try { onLogin(await login(email.trim(), password)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible iniciar sesión'); }
    finally { setLoading(false); }
  }

  return <main className="login-page"><div className="login-panel"><div className="login-brand"><img src={banorteLogo} alt="Banorte"/><span/> <b>boreas</b></div><div className="login-copy"><span className="eyebrow">TU VIDA FINANCIERA, MÁS CLARA ///</span><h1>Tu siguiente paso empieza aquí.</h1><p>Entra a Boreas y convierte tus planes en decisiones más claras.</p></div><form className="login-form" onSubmit={submit}><label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required/></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required/></label>{error && <div className="login-error">{error}</div>}<button className="primary-button login-button" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar a Boreas'} <span>{'->'}</span></button></form><small className="login-note">Tus datos se protegen con una sesión segura.</small></div><div className="login-aside"><div className="aside-mark">B</div><strong>Una banca que<br/>se adapta a ti.</strong><span>Tu contexto. Tus metas.<br/>Un camino más claro.</span></div></main>;
}