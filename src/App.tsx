import { useEffect, useRef, useState } from 'react';
import { sendInteraction, sendMessage, AuthSession, authSchema, ApiError, useMocks } from './api';
import { AdaptiveUIResponse, Action, AdaptiveComponent } from './types';
import { AdaptiveRenderer } from './AdaptiveRenderer';
import banorteLogo from './public/banorte.png';
import { Login } from './Login';

type HistoryItem = { role: 'Tú' | 'Boreas'; text: string };
type Operation = { message: string } | { component: AdaptiveComponent; action: Action; payload?: Record<string, unknown> };
function restoreAuth() {
  try { return authSchema.parse(JSON.parse(sessionStorage.getItem('boreas-auth') || 'null')); }
  catch { sessionStorage.removeItem('boreas-auth'); sessionStorage.removeItem('boreas-session'); return null; }
}
export function App() {
  const [auth, setAuth] = useState<AuthSession | null>(restoreAuth);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState<AdaptiveUIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const session = useRef(sessionStorage.getItem('boreas-session') || undefined);
  const busy = useRef(false);
  const generation = useRef(0);
  const lastOperation = useRef<Operation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('boreas-history') || '[]');
      return Array.isArray(saved) ? saved.filter(item => ['Tú', 'Boreas'].includes(item?.role) && typeof item?.text === 'string') : [];
    } catch { return []; }
  });
  useEffect(() => { sessionStorage.setItem('boreas-history', JSON.stringify(history.slice(-50))); }, [history]);
  useEffect(() => { if (auth) void execute({ message: 'Quiero ver mi dashboard financiero' }, false); }, [auth]);
  useEffect(() => {
    if (answer?.components.some(component => ['confirmation', 'cashflow-alert'].includes(component.type))) {
      document.querySelector<HTMLElement>('[data-pending-action]')?.focus();
    }
  }, [answer]);

  async function execute(operation: Operation, addHistory = true) {
    if (!auth || busy.current) return;
    if (!('message' in operation) && !session.current) return;
    const revision = generation.current;
    busy.current = true; setLoading(true); setError(''); lastOperation.current = operation;
    if ('message' in operation && addHistory) setHistory(items => [...items, { role: 'Tú', text: operation.message }]);
    try {
      const next = 'message' in operation
        ? await sendMessage({ message: operation.message, sessionId: session.current }, auth.token)
        : await sendInteraction({ sessionId: session.current!, componentId: operation.component.id, action: operation.action, payload: operation.payload }, auth.token);
      if (revision !== generation.current) return;
      setAnswer(next); session.current = next.sessionId; sessionStorage.setItem('boreas-session', next.sessionId);
      if (next.message) setHistory(items => [...items, { role: 'Boreas', text: next.message! }]);
    } catch (reason) {
      if (revision !== generation.current) return;
      if (reason instanceof ApiError && reason.status === 401) { logout(); return; }
      setError(reason instanceof Error ? reason.message : 'No pudimos completar la operación.');
    } finally {
      if (revision === generation.current) { busy.current = false; setLoading(false); }
    }
  }
  function submit(message = input) {
    if (!message.trim() || busy.current) return;
    setInput(''); void execute({ message: message.trim() });
  }
  function clear() {
    generation.current++; busy.current = false; setLoading(false); setAnswer(null); setHistory([]); session.current = undefined;
    sessionStorage.removeItem('boreas-session'); sessionStorage.removeItem('boreas-history'); setError(''); setInput('');
  }
  function reset() { clear(); void execute({ message: 'Quiero ver mi dashboard financiero' }, false); }
  function logout() { clear(); setAuth(null); sessionStorage.removeItem('boreas-auth'); }
  if (!auth) return <Login onLogin={value => { clear(); sessionStorage.setItem('boreas-auth', JSON.stringify(value)); setAuth(value); }}/>;
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><img src={banorteLogo} alt="Banorte"/><span className="brand-divider"/><span className="boreas-word">boreas</span></div><div className="topbar-actions"><span className="status-dot">{auth.user.name}</span><button className="icon-button" aria-label="Nueva conversación" title="Nueva conversación" onClick={reset}>+</button><button className="logout-button" onClick={logout}>Salir</button></div></header>
    <main className="main-content">
      {useMocks && <div className="error-banner" role="status">Modo mock explícito: los datos de esta vista son de ejemplo.</div>}
      <section className="hero hero-compact"><div className="eyebrow">TU VIDA FINANCIERA, MÁS CLARA</div><h1>Tu panorama. Tu siguiente paso.</h1><p>Consulta tus finanzas y convierte tus objetivos en un plan.</p>
        <form className="composer" onSubmit={event => { event.preventDefault(); submit(); }}><input value={input} onChange={event => setInput(event.target.value)} maxLength={4000} placeholder="Quiero ahorrar para un celular..." aria-label="Escribe tu objetivo financiero"/><button type="submit" disabled={loading || !input.trim()} aria-label="Enviar mensaje">{loading ? '…' : '→'}</button></form>
        <nav className="suggestions" aria-label="Acciones rápidas">{['Quiero ver mi dashboard financiero','Quiero crear una meta de ahorro','Quiero explorar crédito'].map(item => <button disabled={loading} key={item} onClick={() => submit(item)}>{item}</button>)}</nav>
      </section>
      {error && <div className="error-banner" role="alert"><span>!</span>{error}<button onClick={() => lastOperation.current && void execute(lastOperation.current, false)}>Reintentar</button></div>}
      {loading && <div className="loading-state" role="status"><div className="loader"/><div><strong>Actualizando tu panorama</strong><span>Estamos consultando los datos de tu sesión.</span></div></div>}
      {answer && <section className="workspace" aria-busy={loading}>
        <details className="conversation-rail" open><summary className="rail-label">TU CONVERSACIÓN</summary><div className="history-scroll">{history.map((item, index) => <div className="history-item" key={index}><span>{item.role}</span><p>{item.text}</p></div>)}</div><button className="new-conversation" onClick={reset}>+ Nueva conversación</button></details>
        <div className="adaptive-area"><div className="agent-message" role="status"><div className="boreas-avatar">B</div><div><span className="agent-label">BOREAS</span><p>{answer.message}</p></div></div>
          <fieldset className="adaptive-controls" disabled={loading}><AdaptiveRenderer response={answer} onInteract={(component, action, payload) => { void execute({ component, action, payload }); }}/></fieldset>
        </div>
      </section>}
    </main><footer><span>Boreas · Demostración de hackathon</span><span>Disponible, proyecciones y simulaciones son estimaciones.</span></footer>
  </div>;
}
