import { Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, ShieldCheck, Sparkles } from 'lucide-react';
import '../../styles/auth.css';

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="sa-auth-shell">
      <section className="sa-auth-aside" aria-label="About SkillArena">
        <Link className="sa-auth-brand" to="/"><BrainCircuit size={27} /> <span>Skill<span className="sa-brand-accent">Arena</span></span></Link>
        <div className="sa-aside-content">
          <div className="sa-orbit" aria-hidden="true"><span className="sa-orbit-core"><BrainCircuit size={54} strokeWidth={1.4} /></span></div>
          <p className="sa-aside-eyebrow"><Sparkles size={15} /> YOUR AI INTERVIEW WORKSPACE</p>
          <h2>Practice with purpose.<br /><em>Grow with confidence.</em></h2>
          <p>Sharpen your interview skills with intelligent preparation, personalized insights, and measurable progress.</p>
          <div className="sa-aside-proof"><ShieldCheck size={17} /> Built for thoughtful, focused preparation</div>
        </div>
        <span className="sa-aside-footer">SKILLARENA / INTERVIEW INTELLIGENCE</span>
      </section>
      <section className="sa-auth-main">
        <div className="sa-auth-top"><Link to="/" className="sa-back"><ArrowLeft size={16} /> Back to home</Link><span className="sa-demo-tag">FRONTEND DEMO</span></div>
        <div className="sa-auth-card">
          <span className="sa-auth-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="sa-auth-subtitle">{subtitle}</p>
          {children}
        </div>
        <p className="sa-auth-footnote">Demo interface · Real accounts are not enabled yet</p>
      </section>
    </main>
  );
}
