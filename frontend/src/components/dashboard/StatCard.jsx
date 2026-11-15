export default function StatCard({ label, value, detail, icon: Icon, tone = "lime" }) {
  return <article className={`sa-stat-card ${tone}`}>
    <div className="sa-stat-heading"><span>{label}</span><i><Icon size={19}/></i></div>
    <strong>{value}</strong><small>{detail}</small>
  </article>;
}
