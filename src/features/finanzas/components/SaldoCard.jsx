import { S } from '../constants';
import { fmt } from '../utils';
import { Delta } from './Delta';

export function SaldoCard({ cuenta, compSaldo }) {
  const color = cuenta.saldo >= 0 ? '#22c55e' : '#f87171';
  const antColor = cuenta.saldo >= 0 ? '#166534' : '#991b1b';
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${cuenta.color}` }}>
      <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{cuenta.label}</p>
      <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{fmt(cuenta.saldo)}</p>
      {compSaldo != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <Delta value={cuenta.saldo} comp={compSaldo} />
          <span style={{ color: antColor, fontSize: 10, fontWeight: 500 }}>ant {fmt(compSaldo)}</span>
        </div>
      )}
    </div>
  );
}
