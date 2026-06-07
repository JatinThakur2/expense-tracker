import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#64748b'];

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow)' }}>
      {label && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

export function BarChartCard({ data }) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#656d76' : '#9aa5b4';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Monthly Spending</h3>
      </div>
      <div className="card-body">
        {!data?.length ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>No data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary-soft)' }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function PieChartCard({ data }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">By Category</h3>
      </div>
      <div className="card-body">
        {!data?.length ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>No data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={44}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
