import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, AudioLines, BrainCircuit,
  ChartNoAxesCombined, FileText, Mic2, Sparkles, Target,
  Trophy, UploadCloud, Video
} from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import Button from "../components/common/Button";

const features = [
  {
    icon: <FileText size={20} />,
    title: "Resume intelligence",
    description: "Turn your resume into a clear skills profile. Get structured feedback, identify gaps and understand where to focus next."
  },
  {
    icon: <Mic2 size={20} />,
    title: "AI mock interviews",
    description: "Practice with adaptive interview sessions in text, voice or hybrid mode—built around your role and experience level."
  },
  {
    icon: <ChartNoAxesCombined size={20} />,
    title: "Actionable performance",
    description: "Review detailed feedback on answer quality, communication and technical strengths, then turn insights into progress."
  }
];

const bars = [18, 27, 35, 23, 42, 55, 36, 63, 46, 72, 52, 39, 66, 82, 57, 44, 70, 91, 61, 47, 76, 58, 39, 68, 48, 31, 55, 37, 23];

function Home() {
  return (
    <div className="site-shell">
      <Navbar />

      <main>
        <section className="hero" id="platform">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow"><span className="eyebrow-dot" /> Your next opportunity starts here</div>
              <h1>Prepare with purpose. <span>Perform</span> with confidence.</h1>
              <p className="hero-copy">
                A smarter interview preparation platform that brings your resume,
                realistic AI interviews and performance insights into one focused experience.
              </p>
              <div className="hero-actions">
                <Button href="#get-started">Explore SkillArena <ArrowRight size={16} /></Button>
                <Button variant="quiet" href="#features">Discover the platform</Button>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span>JD</span><span>AK</span><span>MS</span><span>+</span>
                </div>
                <span><span className="proof-stars">★★★★★</span><br />Built for focused career preparation</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Illustration of an AI-powered interview session">
              <div className="orbit" />
              <div className="ai-panel">
                <div className="panel-top">
                  <span className="panel-label">SkillArena · Interview simulation</span>
                  <span className="live-pill">SESSION LIVE</span>
                </div>
                <div className="panel-question">Tell me about a challenging project you worked on.</div>
                <div className="panel-meta"><span>Behavioural · Question 04</span><span>02:18 elapsed</span></div>
                <div className="waveform" aria-hidden="true">
                  {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
                </div>
                <div className="answer-box">
                  <span>Your response is being analysed in real time</span>
                  <span className="answer-icon"><AudioLines size={16} /></span>
                </div>
              </div>
              <div className="float-chip one">
                <span className="chip-icon"><Sparkles size={15} /></span>
                <span><strong>AI-powered feedback</strong>Clear, practical insights</span>
              </div>
              <div className="float-chip two">
                <span className="chip-icon"><Trophy size={15} /></span>
                <span><strong>Progress, made visible</strong>Know what to improve next</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <span className="kicker">One preparation ecosystem</span>
              <h2>Everything you need to show up at your best.</h2>
              <p>Move beyond random practice. Build a repeatable preparation process with tools that work together.</p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <div className="workflow">
              <div className="workflow-copy">
                <span className="kicker">A clearer path forward</span>
                <h2>Prepare. Practice. Improve.</h2>
                <p>SkillArena connects the key steps of interview preparation, so every practice session has a purpose and every insight gives you a next step.</p>
              </div>
              <div className="steps">
                <div className="step"><span className="step-num">01</span><div><h4>Build your profile</h4><p>Upload your resume and understand your current strengths.</p></div><UploadCloud size={18} color="#c7f36b" /></div>
                <div className="step"><span className="step-num">02</span><div><h4>Choose your interview</h4><p>Set your target role, difficulty and preferred interview mode.</p></div><Video size={18} color="#a78bfa" /></div>
                <div className="step"><span className="step-num">03</span><div><h4>Learn from every attempt</h4><p>Review feedback and focus your next round of preparation.</p></div><Target size={18} color="#69dce8" /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="container" id="get-started">
          <div className="cta">
            <span className="kicker">Make your next attempt count</span>
            <h2>Your potential deserves preparation.</h2>
            <p>Start building the confidence that comes from knowing your strengths, practising deliberately and improving with every session.</p>
            <Button href="#platform">Explore the platform <ArrowUpRight size={16} /></Button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Link className="brand" to="/">
            <span className="brand-mark"><BrainCircuit /></span>
            <span>skill<em>arena</em></span>
          </Link>
          <span>© {new Date().getFullYear()} SkillArena. Built for your next move.</span>
          <div className="footer-links">
            <a href="#platform">Platform</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">Workflow</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
