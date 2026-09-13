import { Component, ReactNode, useEffect, useState } from 'react';
import { AdaptiveUIResponse, AdaptiveComponent, Action, actions } from './types';
import { ActivityList, CashflowAlert, FinancialDashboard, GoalDashboard, WidgetProps } from './DashboardWidgets';
import { money, date } from './format';
import { AmortizationView, DecisionInsights, ProductTable } from './FinancialVisuals';
type RendererProps = { response: AdaptiveUIResponse; onInteract: WidgetProps['onInteract'] };
type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] => Array.isArray(value) ? value as Row[] : [];
function CardHead({ component }: { component: AdaptiveComponent }) { return <div className="card-head"><div><h2>{component.title}</h2>{component.description && <p>{component.description}</p>}</div></div>; }
function Summary({ component }: { component: AdaptiveComponent }) { const d = component.data; return <article className="data-card"><CardHead component={component}/><dl className="goal-details">{[['Ingreso mensual',d.monthlyIncome],['Gasto mensual',d.monthlyExpenses],['Ahorro',d.currentSavings],['Disponible estimado',d.availableMonthlyCash]].map(([label,value]) => <div key={String(label)}><dt>{String(label)}</dt><dd>{money(value)}</dd></div>)}</dl></article>; }
function Capacity({ component }: { component: AdaptiveComponent }) { return <article className="data-card capacity-card"><CardHead component={component}/><div className="capacity-value"><span>Capacidad mensual estimada</span><strong>{money(component.data.estimatedMaxPayment)}</strong><em>{String(component.data.note || 'Estimación sujeta a evaluación; no representa aprobación.')}</em></div></article>; }
function Products({ component }: { component: AdaptiveComponent }) {
  const products = rows(component.data.products);
  return <article className="data-card products-card" tabIndex={-1}><CardHead component={component}/>{products.length ? <><ProductTable products={products}/><p className="chart-footnote">Condiciones del catálogo para explorar. Sujetas a evaluación; no representan una aprobación.</p></> : <div className="empty-dashboard">No hay productos disponibles para esta categoría en el catálogo.</div>}</article>;
}
function Simulator({ component, onInteract }: WidgetProps) {
  const d = component.data;
  const products = rows(d.products);
  const [productId, setProductId] = useState(String(d.productId ?? products[0]?.id ?? ''));
  const [value, setValue] = useState(d.propertyValue == null ? '' : String(d.propertyValue));
  const [down, setDown] = useState(d.downPayment == null ? '' : String(d.downPayment));
  const [term, setTerm] = useState(d.termMonths == null ? '' : String(d.termMonths));
  const selected = products.find(product => product.id === productId);
  const [validation, setValidation] = useState('');
  useEffect(() => { if (d.estimatedMonthlyPayment != null) { setValue(String(d.propertyValue)); setDown(String(d.downPayment)); setTerm(String(d.termMonths)); } }, [d]);
  return <article className="data-card simulator-card"><CardHead component={component}/><div className="simulator-layout"><div className="simulator-result"><span>Mensualidad estimada</span><strong>{d.estimatedMonthlyPayment == null ? 'Por calcular' : money(d.estimatedMonthlyPayment)}</strong><small>Calculada con la tasa del catálogo. No incluye costos no informados en el producto.</small></div><form className="goal-edit" onSubmit={event => { event.preventDefault(); if (Number(down) >= Number(value)) { setValidation('El enganche debe ser menor al valor de la vivienda.'); return; } setValidation(''); onInteract(component, 'UPDATE_MORTGAGE_SIMULATION', { productId, propertyValue: Number(value), downPayment: Number(down), termMonths: Number(term) }); }}>
    <label>Producto<select required value={productId} onChange={event => setProductId(event.target.value)}><option value="">Selecciona un producto</option>{products.map(product => <option key={String(product.id)} value={String(product.id)}>{String(product.name)}</option>)}</select></label>
    <label>Valor de la vivienda en MXN<input type="number" required min="0.01" step="0.01" value={value} onChange={event => setValue(event.target.value)}/></label><label>Enganche en MXN<input type="number" required min="0" step="0.01" value={down} onChange={event => setDown(event.target.value)}/></label>
    <label>Plazo en meses<input type="number" required min={Number(selected?.minTermMonths) || 1} max={selected?.maxTermMonths == null ? undefined : Number(selected.maxTermMonths)} step="1" value={term} onChange={event => setTerm(event.target.value)}/></label>
    {validation && <p role="alert">{validation}</p>}<button className="primary-button">Calcular estimación</button></form></div><AmortizationView data={d}/></article>;
}
function GoalForm({ component, onInteract }: WidgetProps) {
  const d = component.data;
  const [name, setName] = useState(String(d.name || ''));
  const [amount, setAmount] = useState(d.targetAmount == null ? '' : String(d.targetAmount));
  const [monthly, setMonthly] = useState(d.monthlyContribution == null ? '' : String(d.monthlyContribution));
  const [targetDate, setTargetDate] = useState(String(d.targetDate || '').slice(0,10));
  useEffect(() => { setName(String(d.name || '')); setAmount(d.targetAmount == null ? '' : String(d.targetAmount)); setMonthly(d.monthlyContribution == null ? '' : String(d.monthlyContribution)); setTargetDate(String(d.targetDate || '').slice(0,10)); }, [d]);
  return <article className="data-card goal-card"><CardHead component={component}/><form className="goal-edit" onSubmit={event => { event.preventDefault(); onInteract(component, 'REQUEST_CREATE_SAVINGS_GOAL', { name, targetAmount: Number(amount), ...(monthly ? { monthlyContribution: Number(monthly) } : {}), ...(targetDate ? { targetDate } : {}), category: d.category, checklist: d.checklist }); }}>
    <label>Nombre de tu meta<input required maxLength={150} value={name} onChange={event => setName(event.target.value)} placeholder="¿Qué quieres lograr?"/></label>
    <label>Monto objetivo en MXN<input type="number" required min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)}/></label>
    <label>Aportación mensual en MXN<input type="number" min="0.01" step="0.01" value={monthly} onChange={event => setMonthly(event.target.value)}/><small>Opcional; permite estimar la fecha de finalización.</small></label>
    <label>Fecha objetivo<input type="date" value={targetDate} onChange={event => setTargetDate(event.target.value)}/></label>
    {Array.isArray(d.checklist) && <div><strong>Próximos pasos</strong><ul>{d.checklist.map((item,index) => <li key={index}>{String(item)}</li>)}</ul></div>}
    <button className="primary-button">Revisar mi meta →</button></form></article>;
}
function Confirmation({ component, onInteract }: WidgetProps) {
  const d = component.data;
  const changes = (d.changes || d) as Row;
  const action = typeof d.action === 'string' && (actions as readonly string[]).includes(d.action) ? d.action as Action : 'CONFIRM_CREATE_SAVINGS_GOAL';
  return <article className="data-card confirmation-card" data-pending-action tabIndex={-1}><span className="dashboard-kicker">PENDIENTE DE CONFIRMACIÓN</span><CardHead component={component}/><p>{String(d.message)}</p><dl className="goal-details">
    {!!changes.name && <div><dt>Nombre</dt><dd>{String(changes.name)}</dd></div>}
    {changes.targetAmount != null && <div><dt>Monto objetivo</dt><dd>{money(changes.targetAmount)}</dd></div>}
    {changes.monthlyContribution != null && <div><dt>Aportación mensual</dt><dd>{money(changes.monthlyContribution)}</dd></div>}
    {!!changes.targetDate && <div><dt>Fecha objetivo</dt><dd>{date(changes.targetDate)}</dd></div>}
    {!!changes.status && <div><dt>Nuevo estado</dt><dd>{({ PAUSED: 'Pausada', ACTIVE: 'Activa', CANCELLED: 'Cancelada', ARCHIVED: 'Archivada', DELETED: 'Eliminada' } as Record<string,string>)[String(changes.status)]}</dd></div>}
  </dl><div className="confirm-actions"><button className="primary-button" onClick={() => onInteract(component, action)}>{String(d.confirmLabel || 'Confirmar')}</button><button className="text-button" onClick={() => onInteract(component, 'CANCEL')}>{String(d.cancelLabel || 'Cancelar')}</button></div></article>;
}
function Progress({ component }: { component: AdaptiveComponent }) { const d = component.data; return <article className="data-card progress-card"><CardHead component={component}/><strong>{money(d.currentAmount)} de {money(d.targetAmount)}</strong><p>Aportación mensual: {money(d.monthlyContribution)}</p><p>Fecha objetivo: {date(d.targetDate)}</p></article>; }
class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="error-banner" role="alert">No pudimos mostrar esta vista. Actualiza el tablero para continuar.</div> : this.props.children; }
}
export function AdaptiveRenderer({ response, onInteract }: RendererProps) {
  return <ViewBoundary key={response.sessionId}><div className="component-stack">{response.components.length === 0 && <div className="empty-dashboard">No hay información para mostrar en esta vista.</div>}{response.components.map(component => {
    const props = { component, onInteract };
    switch (component.type) {
      case 'decision-insights': return <DecisionInsights key={component.id} {...props}/>;
      case 'financial-dashboard': return <FinancialDashboard key={component.id} {...props}/>;
      case 'goal-dashboard': return <GoalDashboard key={component.id} {...props}/>;
      case 'activity-list': return <ActivityList key={component.id} component={component}/>;
      case 'cashflow-alert': return <CashflowAlert key={component.id} {...props}/>;
      case 'financial-summary': return <Summary key={component.id} component={component}/>;
      case 'mortgage-capacity': return <Capacity key={component.id} component={component}/>;
      case 'mortgage-simulator': return <Simulator key={component.id} {...props}/>;
      case 'product-comparison': case 'credit-options': return <Products key={component.id} component={component}/>;
      case 'savings-goal-form': return <GoalForm key={component.id} {...props}/>;
      case 'confirmation': return <Confirmation key={component.id} {...props}/>;
      case 'goal-progress': return <Progress key={component.id} component={component}/>;
      default: return <div key={component.id} className="empty-dashboard" role="status">Esta sección todavía no está disponible. Puedes continuar con el resto del tablero.</div>;
    }
  })}</div></ViewBoundary>;
}
