import { useEffect, useState } from 'react';
import { Action, AdaptiveComponent } from './types';
import { money, date } from './format';
import { CashflowChart, GoalTable, ImpactBridge, MovementTable } from './FinancialVisuals';

export type WidgetProps = { component: AdaptiveComponent; onInteract: (component: AdaptiveComponent, action: Action, payload?: Record<string, unknown>) => void };
type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] => Array.isArray(value) ? value as Row[] : [];
const labels: Record<string, string> = { DEPOSIT: 'Depósito / aportación', EXPENSE: 'Gasto', INCOME: 'Ingreso', WITHDRAWAL: 'Retiro' };
const statuses: Record<string, string> = { ACTIVE: 'Activa', COMPLETED: 'Completada', PAUSED: 'Pausada', CANCELLED: 'Cancelada', ARCHIVED: 'Archivada' };

export function FinancialDashboard({ component, onInteract }: WidgetProps) {
  const d = component.data;
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('DEPOSIT');
  const [goalId, setGoalId] = useState(String(d.selectedGoalId ?? ''));
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  useEffect(() => setGoalId(String(d.selectedGoalId ?? '')), [d.selectedGoalId]);
  const goals = rows(d.goals).filter(goal => ['ACTIVE', 'COMPLETED'].includes(String(goal.status)));
  const activeGoalId = goals.some(goal => goal.id === goalId) ? goalId : '';
  const linkGoal = ['DEPOSIT', 'WITHDRAWAL'].includes(type);
  const metrics = [['Disponible estimado', d.availableMonthlyCash], ['Ingreso mensual', d.monthlyIncome], ['Gasto mensual', d.monthlyExpenses], ['Deuda mensual', d.monthlyDebtPayments], ['Ahorro líquido', d.currentSavings]];
  return <article className="data-card dashboard-card"><div className="card-head"><div><span className="dashboard-kicker">{String(d.period ?? 'PANORAMA FINANCIERO')}</span><h2>{component.title}</h2><p>Disponible después de gastos, deuda y retiros del periodo.</p></div><button className="text-button" onClick={() => onInteract(component, 'REFRESH_DASHBOARD')}>Actualizar</button></div>
    <div className="dashboard-metrics">{metrics.map(([label, value], index) => <div className={'metric ' + (index === 0 ? 'metric-primary' : '')} key={String(label)}><span>{String(label)}</span><strong>{money(value)}</strong></div>)}<div className="metric"><span>Score crediticio</span><strong>{d.creditScore == null ? 'Sin dato' : String(d.creditScore)}</strong><small>Si está disponible en tu perfil</small></div></div>
    <CashflowChart data={d}/>
    <details className="movement-drawer"><summary><span><b>Registrar un movimiento</b><small>Aportar, ingresar, gastar o retirar</small></span><span aria-hidden="true">＋</span></summary>
    <form className="movement-form" onSubmit={event => { event.preventDefault(); onInteract(component, 'RECORD_FINANCIAL_MOVEMENT', { type, amount: Number(amount), ...(linkGoal && activeGoalId ? { goalId: activeGoalId } : {}), category, note, ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}) }); }}>
      <div className="form-intro"><h3>Registrar movimiento</h3><p>Revisa el impacto y confirma antes de guardarlo.</p></div>
      <label>Tipo<select value={type} onChange={event => setType(event.target.value)}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Monto en MXN<input type="number" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} placeholder="Monto"/></label>
      {linkGoal && <label>Meta<select value={activeGoalId} onChange={event => setGoalId(event.target.value)}><option value="">Ahorro general</option>{goals.map(goal => <option key={String(goal.id)} value={String(goal.id)}>{String(goal.name)}</option>)}</select></label>}
      <label>Categoría<input maxLength={80} value={category} onChange={event => setCategory(event.target.value)} placeholder="Opcional"/></label>
      <label>Nota<input maxLength={240} value={note} onChange={event => setNote(event.target.value)} placeholder="Opcional"/></label>
      <label>Fecha y hora<input type="datetime-local" value={occurredAt} onChange={event => setOccurredAt(event.target.value)}/><small>Vacío: fecha actual</small></label>
      <button className="primary-button" type="submit">Revisar movimiento →</button>
    </form></details>
    <button className="text-button credit-link" onClick={() => onInteract(component, 'REQUEST_CREDIT_OPTIONS')}>Explorar opciones de crédito →</button>
  </article>;
}

function GoalItem({ goal, selected, component, onInteract }: WidgetProps & { goal: Row; selected: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(String(goal.name));
  const [target, setTarget] = useState(String(goal.targetAmount));
  const [monthly, setMonthly] = useState(goal.monthlyContribution == null ? '' : String(goal.monthlyContribution));
  const [targetDate, setTargetDate] = useState(goal.targetDate ? String(goal.targetDate).slice(0, 10) : '');
  const [amount, setAmount] = useState('');
  const [movementType, setMovementType] = useState('DEPOSIT');
  const progress = typeof goal.progress === 'number' ? goal.progress : 0;
  const action = (value: Action) => onInteract(component, value, { goalId: goal.id });
  const checklist = rows(goal.metadata ? [goal.metadata] : [])[0]?.checklist;
  return <div className={'goal-mini ' + (selected ? 'selected-goal' : '')} tabIndex={-1}>
    <div className="goal-mini-head"><h3>{String(goal.name)}</h3><span>{Math.round(progress)}%</span></div>
    <span className="goal-status">{statuses[String(goal.status)] || String(goal.status)}</span>
    <progress max="100" value={progress} aria-label={'Progreso de ' + String(goal.name)}/>
    <p>{money(goal.currentAmount)} de {money(goal.targetAmount)}</p>
    <dl className="goal-details"><div><dt>Aportación mensual</dt><dd>{money(goal.monthlyContribution)}</dd></div><div><dt>Fecha objetivo</dt><dd>{date(goal.targetDate)}</dd></div><div><dt>Finalización estimada</dt><dd>{date(goal.estimatedDate)}</dd></div></dl>
    {goal.delayed === true && <p className="goal-warning">Con la aportación actual, la fecha estimada supera tu fecha objetivo.</p>}
    {Array.isArray(checklist) && <details><summary>Próximos pasos</summary><ul>{checklist.map((item, index) => <li key={index}>{String(item)}</li>)}</ul></details>}
    <div className="goal-actions"><button className="text-button" onClick={() => action('SELECT_GOAL')}>{selected ? 'Meta seleccionada' : 'Seleccionar meta'}</button><button className="text-button" onClick={() => setEditing(!editing)}>{editing ? 'Cerrar edición' : 'Editar plan'}</button></div>
    {editing && <form className="goal-edit" onSubmit={event => { event.preventDefault(); onInteract(component, 'UPDATE_GOAL', { goalId: goal.id, name, targetAmount: Number(target), ...(monthly ? { monthlyContribution: Number(monthly) } : {}), ...(targetDate ? { targetDate } : {}) }); }}>
      <label>Nombre<input required maxLength={150} value={name} onChange={event => setName(event.target.value)}/></label>
      <label>Monto objetivo<input type="number" required min="0.01" step="0.01" value={target} onChange={event => setTarget(event.target.value)}/></label>
      <label>Aportación mensual<input type="number" min="0.01" step="0.01" value={monthly} onChange={event => setMonthly(event.target.value)}/></label>
      <label>Fecha objetivo<input type="date" value={targetDate} onChange={event => setTargetDate(event.target.value)}/></label>
      <button className="primary-button">Revisar cambios</button>
    </form>}
    {['ACTIVE', 'COMPLETED'].includes(String(goal.status)) && <form className="goal-contribution" onSubmit={event => { event.preventDefault(); onInteract(component, 'RECORD_FINANCIAL_MOVEMENT', { type: movementType, amount: Number(amount), goalId: goal.id, category: 'Meta: ' + String(goal.name).slice(0, 70) }); }}>
      <label>Movimiento en esta meta<select value={movementType} onChange={event => setMovementType(event.target.value)}><option value="DEPOSIT">Aportar dinero</option><option value="WITHDRAWAL">Retirar dinero</option></select></label>
      <label>Monto en MXN<input type="number" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)}/></label><button className="primary-button">Revisar</button>
    </form>}
    <details className="goal-manage"><summary>Administrar meta</summary><div className="goal-actions">{goal.status === 'ACTIVE' && <button onClick={() => action('PAUSE_GOAL')}>Pausar</button>}{goal.status !== 'ACTIVE' && <button onClick={() => action('RESUME_GOAL')}>Reactivar</button>}<button onClick={() => action('CANCEL_GOAL')}>Cancelar meta</button><button onClick={() => action('ARCHIVE_GOAL')}>Archivar</button><button onClick={() => action('DELETE_GOAL')}>Eliminar</button></div><p>Cada cambio requiere confirmación y conserva el historial.</p></details>
  </div>;
}
export function GoalDashboard(props: WidgetProps) {
  const goals = rows(props.component.data.goals);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  return <article className="data-card dashboard-card"><div className="card-head"><div><span className="dashboard-kicker">PLANES / SEGUIMIENTO</span><h2>{props.component.title}</h2><p>{goals.length} metas en tu ruta financiera</p></div><div className="segmented-control" aria-label="Vista de metas"><button aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Tarjetas</button><button aria-pressed={view === 'table'} onClick={() => setView('table')}>Tabla</button></div></div>{goals.length ? view === 'table' ? <GoalTable goals={goals} selectedGoalId={props.component.data.selectedGoalId} onSelect={goalId => { props.onInteract(props.component, 'SELECT_GOAL', { goalId }); setView('cards'); }}/> : <div className="goal-dashboard-grid">{goals.map(goal => <GoalItem {...props} goal={goal} selected={goal.id === props.component.data.selectedGoalId} key={String(goal.id) + String(goal.updatedAt)}/>)}</div> : <div className="empty-dashboard">Aún no tienes metas. Usa “Crear una meta de ahorro” para comenzar.</div>}</article>;
}
export function ActivityList({ component }: { component: AdaptiveComponent }) {
  const movements = rows(component.data.movements);
  return <article className="data-card activity-card"><div className="card-head"><div><span className="dashboard-kicker">HISTORIAL / TRAZABILIDAD</span><h2>{component.title}</h2><p>Cada decisión confirmada deja un registro.</p></div></div>{movements.length ? <MovementTable movements={movements}/> : <div className="empty-dashboard">Los movimientos confirmados aparecerán aquí.</div>}</article>;
}
export function CashflowAlert({ component, onInteract }: WidgetProps) {
  const d = component.data;
  return <article className="data-card cashflow-alert" data-pending-action tabIndex={-1} role="region" aria-label="Movimiento pendiente de confirmación"><div className="alert-symbol">!</div><div><span className="dashboard-kicker">VISTA PREVIA / SIN REGISTRAR</span><h2>{component.title}</h2><p><strong>{labels[String(d.type)]} · {money(d.amount)}</strong></p><p>{d.goalName ? 'Meta: ' + String(d.goalName) : 'Ahorro / flujo general'}</p><p>{String(d.category || 'Sin categoría')} · {d.occurredAt ? date(d.occurredAt) : 'Fecha al confirmar'}</p><p>{String(d.warning || 'Revisa los datos antes de confirmar.')}</p>{!!d.note && <p>{String(d.note)}</p>}<div className="alert-numbers"><span>Disponible antes<b>{money(d.currentAvailable)}</b></span><span>Disponible después<b>{money(d.projectedAvailable)}</b></span><span>Ahorro después<b>{money(d.projectedSavings)}</b></span></div>
    <ImpactBridge data={d}/>
    {rows(d.goalImpacts).map(impact => <p className="goal-warning" key={String(impact.goalId)}>{String(impact.name)}: {impact.delayMonths == null ? 'no es posible estimar el retraso sin una aportación mensual' : 'retraso estimado de ' + String(impact.delayMonths) + ' mes(es)'}.</p>)}
    <div className="confirm-actions"><button className="primary-button" onClick={() => onInteract(component, 'CONFIRM_RECORD_FINANCIAL_MOVEMENT')}>Confirmar movimiento</button><button className="text-button" onClick={() => onInteract(component, 'CANCEL')}>Cancelar</button></div><p>Impacto estimado para el periodo. La operación se guarda al confirmar.</p></div></article>;
}
