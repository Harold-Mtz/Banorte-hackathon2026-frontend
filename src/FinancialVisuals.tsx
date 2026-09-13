import { useState } from 'react';
import { money, date, percent } from './format';
import { Action } from './types';
import type { WidgetProps } from './DashboardWidgets';

type Row = Record<string, unknown>;
const numeric = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const list = (value: unknown): Row[] => Array.isArray(value) ? value as Row[] : [];

export function CashflowChart({ data }: { data: Row }) {
  const totals = (data.totals || {}) as Row;
  const values = [
    { label: 'Ingresos', value: numeric(data.monthlyIncome), color: 'income-color' },
    { label: 'Gastos', value: numeric(data.monthlyExpenses), color: 'expense-color' },
    { label: 'Deuda mensual', value: numeric(data.monthlyDebtPayments), color: 'debt-color' },
    ...(typeof totals.monthlyWithdrawals === 'number' ? [{ label: 'Retiros del mes', value: totals.monthlyWithdrawals, color: 'withdrawal-color' }] : []),
    { label: 'Disponible', value: numeric(data.availableMonthlyCash), color: numeric(data.availableMonthlyCash) < 0 ? 'expense-color' : 'available-color' }
  ];
  const maximum = Math.max(...values.map(item => Math.abs(item.value)), 1);
  return <section className="financial-chart" aria-label="Gráfica de flujo mensual">
    <div className="chart-heading"><div><span className="section-overline">EL MES EN PERSPECTIVA</span><h3>Así se mueve tu dinero</h3></div><span className="chart-unit">MXN</span></div>
    <div className="flow-bars">{values.map(item => <div className="flow-bar-row" key={item.label}><span>{item.label}</span><div className="flow-bar-track"><i className={item.color} style={{ width: Math.abs(item.value) / maximum * 100 + '%' }}/></div><strong className={item.value < 0 ? 'negative' : ''}>{money(item.value)}</strong></div>)}</div>
    <p className="chart-footnote">Compara ingresos, compromisos y margen del periodo. El disponible es una estimación.</p>
  </section>;
}

export function ImpactBridge({ data }: { data: Row }) {
  const before = numeric(data.currentAvailable);
  const after = numeric(data.projectedAvailable);
  const maximum = Math.max(Math.abs(before), Math.abs(after), 1);
  return <div className="impact-bridge" aria-label="Comparación del disponible antes y después">
    <div className="impact-scenario"><span>Si conservas tu plan</span><strong>{money(before)}</strong><div className="impact-bar"><i style={{ width: Math.abs(before) / maximum * 100 + '%' }} className={before < 0 ? 'expense-color' : 'available-color'}/></div><small>Disponible actual</small></div>
    <span className="impact-arrow" aria-hidden="true">→</span>
    <div className={'impact-scenario ' + (after < 0 ? 'scenario-warning' : '')}><span>Si confirmas el movimiento</span><strong>{money(after)}</strong><div className="impact-bar"><i style={{ width: Math.abs(after) / maximum * 100 + '%' }} className={after < 0 ? 'expense-color' : 'debt-color'}/></div><small>Disponible proyectado</small></div>
  </div>;
}

export function DecisionInsights({ component, onInteract }: WidgetProps) {
  const d = component.data;
  const ai = d.source === 'ai';
  const signals = list(d.signals);
  const steps = list(d.nextSteps);
  return <article className="decision-radar" aria-label="Radar Boreas de decisiones">
    <div className="radar-topline"><span className="radar-wordmark"><span className="radar-spark" aria-hidden="true">✦</span> RADAR BOREAS</span><span className={'intelligence-badge ' + (ai ? 'is-ai' : '')}>{ai ? 'LECTURA CON IA' : 'LECTURA FINANCIERA'}</span></div>
    <div className="radar-intro"><div><h2>{String(d.headline)}</h2><p>{String(d.summary)}</p></div><div className="radar-orbit" aria-hidden="true"><i/><i/><i/><span>✦</span><b/></div></div>
    <div className="radar-signals">{signals.map(signal => <div key={String(signal.id)} className={'radar-signal signal-' + String(signal.tone)}><span><i/>{String(signal.label)}</span>{signal.value != null && <strong>{signal.format === 'money' ? money(signal.value) : signal.format === 'percent' ? percent(signal.value) : new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(numeric(signal.value))}</strong>}<p>{String(signal.detail)}</p></div>)}</div>
    {steps.length > 0 && <div className="radar-next"><span className="section-overline">TU SIGUIENTE DECISIÓN</span><div className="radar-step-grid">{steps.map((step, index) => <div className="radar-step" key={String(step.label)}><span className="step-index">{String(index + 1).padStart(2, '0')}</span><div>{step.action === 'SELECT_GOAL' || step.action === 'REQUEST_CREDIT_OPTIONS' ? <button onClick={() => onInteract(component, step.action as Action, step.goalId ? { goalId: step.goalId } : {})}>{String(step.label)} <span aria-hidden="true">↗</span></button> : <strong>{String(step.label)}</strong>}<p>{String(step.reason)}</p></div></div>)}</div></div>}
    <details className="radar-evidence"><summary>¿En qué se basa esta lectura?</summary><ul>{Array.isArray(d.evidence) && d.evidence.map((item, index) => <li key={index}>{String(item)}</li>)}</ul><p>{ai ? 'La IA priorizó esta lectura a partir de tus datos. Los cálculos provienen del dominio financiero.' : 'Lectura calculada con tus datos actuales. La personalización con IA no se aplicó a esta vista.'}</p></details>
  </article>;
}

export function GoalTable({ goals, selectedGoalId, onSelect }: { goals: Row[]; selectedGoalId: unknown; onSelect: (goalId: string) => void }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de metas"><table className="financial-table"><caption>Tu ruta de metas</caption><thead><tr><th scope="col">Meta</th><th scope="col">Progreso</th><th scope="col">Ahorrado / objetivo</th><th scope="col">Cada mes</th><th scope="col">Fecha objetivo</th><th scope="col">Fecha estimada</th><th scope="col">Acción</th></tr></thead><tbody>{goals.map(goal => <tr key={String(goal.id)} className={goal.id === selectedGoalId ? 'selected-table-row' : ''}><th scope="row">{String(goal.name)}</th><td><div className="table-progress"><progress max="100" value={numeric(goal.progress)} aria-label={'Progreso de ' + String(goal.name)}/><span>{Math.round(numeric(goal.progress))}%</span></div></td><td>{money(goal.currentAmount)}<small>de {money(goal.targetAmount)}</small></td><td>{money(goal.monthlyContribution)}</td><td>{date(goal.targetDate)}</td><td><span className={goal.delayed ? 'delay-indicator' : ''}>{date(goal.estimatedDate)}</span></td><td><button className="table-action" onClick={() => onSelect(String(goal.id))}>{goal.id === selectedGoalId ? 'Seleccionada' : 'Ver plan ↗'}</button></td></tr>)}</tbody></table></div>;
}

export function ProductTable({ products }: { products: Row[] }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla comparativa de crédito"><table className="financial-table product-table"><caption>Compara las condiciones del catálogo</caption><thead><tr><th scope="col">Producto</th><th scope="col">Tasa anual</th><th scope="col">CAT</th><th scope="col">Plazo</th><th scope="col">Monto mínimo</th><th scope="col">Monto máximo</th></tr></thead><tbody>{products.map(product => <tr key={String(product.id)}><th scope="row">{String(product.name)}<small>{String(product.description || '')}</small></th><td className="table-rate">{percent(product.annualRate)}</td><td>{percent(product.cat)}</td><td>{product.minTermMonths == null ? '—' : String(product.minTermMonths)}–{product.maxTermMonths == null ? '—' : String(product.maxTermMonths)}<small>meses</small></td><td>{money(product.minimumAmount)}</td><td>{money(product.maximumAmount)}</td></tr>)}</tbody></table></div>;
}

export function MovementTable({ movements }: { movements: Row[] }) {
  const [filter, setFilter] = useState('ALL');
  const types: Record<string,string> = { ALL: 'Todos', DEPOSIT: 'Aportaciones', INCOME: 'Ingresos', EXPENSE: 'Gastos', WITHDRAWAL: 'Retiros' };
  const visible = movements.filter(item => filter === 'ALL' || item.type === filter);
  return <div><div className="table-toolbar"><div className="segmented-control" aria-label="Filtrar movimientos">{Object.entries(types).map(([key,label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div><span>{visible.length} registros recientes</span></div>
    {visible.length ? <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de actividad"><table className="financial-table"><caption>Movimientos registrados</caption><thead><tr><th scope="col">Movimiento</th><th scope="col">Categoría / nota</th><th scope="col">Fecha</th><th scope="col" className="align-right">Monto</th></tr></thead><tbody>{visible.map(item => <tr key={String(item.id)}><th scope="row"><span className={'movement-tag tag-' + String(item.type).toLowerCase()}><i/>{types[String(item.type)]}</span></th><td>{String(item.category || 'Sin categoría')}{!!item.note && <small>{String(item.note)}</small>}</td><td>{date(item.occurredAt)}</td><td className={'align-right amount-cell ' + (['EXPENSE','WITHDRAWAL'].includes(String(item.type)) ? 'negative' : 'positive')}>{['EXPENSE','WITHDRAWAL'].includes(String(item.type)) ? '−' : '+'}{money(item.amount)}</td></tr>)}</tbody></table></div> : <div className="empty-dashboard">No hay movimientos de este tipo en la actividad reciente.</div>}
  </div>;
}

export function AmortizationView({ data }: { data: Row }) {
  const schedule = list(data.schedule);
  const [expanded, setExpanded] = useState(false);
  if (!schedule.length) return null;
  const maximum = Math.max(...schedule.map(row => numeric(row.remainingBalance)), 1);
  const width = 680, height = 180, pad = 12;
  const points = schedule.map((row, index) => (pad + index / Math.max(schedule.length - 1, 1) * (width - pad * 2)) + ',' + (pad + (1 - numeric(row.remainingBalance) / maximum) * (height - pad * 2))).join(' ');
  const visible = expanded ? schedule : schedule.slice(0, 6);
  return <section className="amortization-section"><div className="chart-heading"><div><span className="section-overline">EL CAMINO DE TU CRÉDITO</span><h3>Así disminuye el saldo</h3></div><span className="chart-unit">{schedule.length} meses</span></div>
    <div className="amortization-summary"><div><span>Capital a financiar</span><strong>{money(data.loanAmount)}</strong></div><div><span>Intereses estimados</span><strong>{money(data.totalInterest)}</strong></div><div><span>Total estimado</span><strong>{money(data.totalPayment)}</strong></div></div>
    <figure className="amortization-chart"><svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label="Saldo restante por mes, calculado por el servicio de amortización"><line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="currentColor" opacity=".15"/><polygon points={pad + ',' + (height-pad) + ' ' + points + ' ' + (width-pad) + ',' + (height-pad)} fill="#d62f31" opacity=".08"/><polyline points={points} fill="none" stroke="#d62f31" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/></svg><figcaption><span>Mes {String(schedule[0].paymentNumber)}</span><span>Saldo por amortizar</span><span>Mes {String(schedule[schedule.length-1].paymentNumber)}</span></figcaption></figure>
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de amortización"><table className="financial-table"><caption>Amortización estimada</caption><thead><tr><th scope="col">Mes</th><th scope="col">Pago</th><th scope="col">A capital</th><th scope="col">Intereses</th><th scope="col">Saldo restante</th></tr></thead><tbody>{visible.map(row => <tr key={String(row.paymentNumber)}><th scope="row">{String(row.paymentNumber).padStart(2, '0')}</th><td>{money(row.payment)}</td><td>{money(row.principal)}</td><td>{money(row.interest)}</td><td>{money(row.remainingBalance)}</td></tr>)}</tbody></table></div>
    {schedule.length > 6 && <button className="table-action amortization-toggle" onClick={() => setExpanded(!expanded)}>{expanded ? 'Ver primeros meses' : 'Ver calendario completo (' + schedule.length + ' meses)'}</button>}
    <p className="chart-footnote">Pagos calculados por el servicio. La última mensualidad puede ajustar diferencias de redondeo.</p>
  </section>;
}
