import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BrainCircuit, CalendarDays, Clock3, FileText,
  Flame, Mic2, Sparkles, Target, Trophy, TrendingUp, ChartNoAxesCombined,
  Code2, MessageCircle, Lightbulb
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";

const stats = [
  { label: "Interviews completed", value: "08", detail: "Practice sessions", icon: Mic2, tone: "teal" },
  { label: "Average performance", value: "76%", detail: "Across sample sessions", icon: Target, tone: "blue" },
  { label: "Practice time", value: "4.5h", detail: "Total time invested", icon: Clock3, tone: "violet" },
  { label: "Current streak", value: "03 days", detail: "Keep showing up", icon: Flame, tone: "amber" },
];
const activity = [
  ["JavaScript Fundamentals", "Technical interview", "Yesterday", "82%", "teal"],
  ["Frontend Developer Role", "Role-based practice", "2 days ago", "74%", "blue"],
  ["Behavioral Questions", "Communication practice", "4 days ago", "71%", "violet"],
];
const suggestions = [
  ["TECHNICAL", "Practice JavaScript closures", "Strengthen a core frontend concept.", "15 min"],
  ["COMMUNICATION", "Improve your introduction", "Make your first interview answer clearer.", "10 min"],
];
const trend = [38, 52, 45, 64, 58, 73, 68, 82, 76, 91, 84, 96];
const skills = [
  { name: "Technical knowledge", score: 82, color: "teal", icon: Code2 },
  { name: "Communication", score: 68, color: "blue", icon: MessageCircle },
  { name: "Problem solving", score: 74, color: "violet", icon: Lightbulb },
];

function AnalyticsSection() {
  return (
    <section className="sa-analytics-section">
      <div className="sa-section-heading">
        <div><span className="sa-section-kicker">PERFORMANCE INSIGHTS</span><h2>Your analytics</h2><p>A snapshot of your preparation progress.</p></div>
        <span className="sa-period-pill"><TrendingUp size={13}/> Last 30 days</span>
      </div>
      <div className="sa-analytics-grid">
        <article className="sa-analytic-card sa-trend-card">
          <div className="sa-analytic-head"><div><span className="sa-card-kicker">PERFORMANCE TREND</span><h3>You're building momentum</h3></div><span className="sa-trend-indicator"><TrendingUp size={14}/> +12.8%</span></div>
          <div className="sa-trend-summary"><strong>76<span>%</span></strong><small>Average score <i>·</i> sample data</small></div>
          <div className="sa-chart-wrap" role="img" aria-label="Illustrative performance trend increasing over twelve practice points">
            <div className="sa-chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div className="sa-chart-main">
              <div className="sa-chart-gridlines"><i/><i/><i/><i/><i/></div>
              <svg className="sa-trend-svg" viewBox="0 0 600 190" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="saTrendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#63d6c5" stopOpacity=".28"/><stop offset="100%" stopColor="#63d6c5" stopOpacity="0"/></linearGradient></defs>
                <path d="M0 150 C28 143 34 125 55 130 S88 118 109 125 S143 92 164 105 S198 95 218 101 S251 73 273 83 S306 68 327 78 S361 49 382 61 S415 58 436 66 S470 34 491 44 S524 37 545 46 S578 18 600 23 L600 190 L0 190Z" fill="url(#saTrendFill)"/>
                <path d="M0 150 C28 143 34 125 55 130 S88 118 109 125 S143 92 164 105 S198 95 218 101 S251 73 273 83 S306 68 327 78 S361 49 382 61 S415 58 436 66 S470 34 491 44 S524 37 545 46 S578 18 600 23" fill="none" stroke="#63d6c5" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/>
                <circle cx="600" cy="23" r="5" fill="#63d6c5" stroke="#13232d" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
              </svg>
              <div className="sa-chart-x"><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div>
            </div>
          </div>
        </article>
        <article className="sa-analytic-card sa-skills-card">
          <div className="sa-analytic-head"><div><span className="sa-card-kicker">SKILL BREAKDOWN</span><h3>Areas of strength</h3></div><ChartNoAxesCombined size={18}/></div>
          <div className="sa-skill-list">
            {skills.map(({name,score,color,icon:Icon}) => <div className="sa-skill-row" key={name}>
              <div className="sa-skill-meta"><span><i className={`sa-skill-icon ${color}`}><Icon size={14}/></i>{name}</span><strong>{score}%</strong></div>
              <div className="sa-skill-track"><i className={color} style={{"--skill-value": `${score}%`}}/></div>
            </div>)}
          </div>
          <div className="sa-insight"><Sparkles size={15}/><p><strong>Focus opportunity</strong> — Communication is your biggest opportunity to improve.</p></div>
        </article>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return <main className="sa-dashboard">
    <section className="sa-welcome">
      <div><div className="sa-eyebrow"><Sparkles size={14} /> YOUR PREPARATION SPACE</div><h1>{greeting}, Tanmay <span>✦</span></h1><p>Small, consistent steps today can make a big difference in your next interview.</p></div>
      <div className="sa-date"><CalendarDays size={16} /> Your learning dashboard</div>
    </section>

    <section className="sa-hero">
      <div className="sa-hero-copy"><div className="sa-ready"><i /> READY WHEN YOU ARE</div><h2>Turn preparation<br />into <em>confidence.</em></h2><p>Pick up where you left off or start a focused practice session.</p><Link to="/interviews" className="sa-primary">Explore interview practice <ArrowUpRight size={16} /></Link></div>
      <div className="sa-hero-art" aria-hidden="true"><div className="sa-orbit orbit-one" /><div className="sa-orbit orbit-two" /><div className="sa-brain"><BrainCircuit size={68} /></div><span className="sa-float">✦ AI-POWERED</span></div>
    </section>

    <section className="sa-stats">{stats.map(s => <StatCard key={s.label} {...s} />)}</section>
    <AnalyticsSection />

    <div className="sa-columns">
      <section className="sa-panel"><div className="sa-panel-title"><div><small>YOUR JOURNEY</small><h2>Recent activity</h2></div><Link to="/interviews">View all <ArrowRight size={14} /></Link></div>
        {activity.map(([title, type, date, score, tone]) => <article className="sa-activity" key={title}><div className={`sa-activity-icon ${tone}`}><FileText size={18} /></div><div className="sa-activity-copy"><strong>{title}</strong><span>{type} · {date}</span></div><b>{score}</b><ArrowUpRight size={15} /></article>)}
        <p className="sa-sample-note">Illustrative sample data — connect the interview API to show your actual history.</p>
      </section>
      <section className="sa-panel"><div className="sa-panel-title"><div><small>NEXT BEST STEPS</small><h2>Recommended for you</h2></div><Sparkles size={18} /></div>
        {suggestions.map(([tag, title, desc, time]) => <article className="sa-suggestion" key={title}><div><span>{tag}</span><small><Clock3 size={12} /> {time}</small></div><strong>{title}</strong><p>{desc}</p><Link to="/interviews">Explore practice <ArrowRight size={13} /></Link></article>)}
      </section>
    </div>
    <section className="sa-bottom-tip"><i><Trophy size={19} /></i><div><strong>Consistency beats intensity.</strong><p>A short practice session today is better than waiting for the perfect time.</p></div><Link to="/interviews" aria-label="Start practice">→</Link></section>
  </main>;
}
