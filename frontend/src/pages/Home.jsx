
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, FileText, Mic2, Sparkles, Target, Zap } from "lucide-react";

function Home() {
  const features = [
    {
      icon: FileText,
      title: "Resume Intelligence",
      description: "Analyze your resume, identify skill gaps, and discover opportunities to improve your profile.",
    },
    {
      icon: BrainCircuit,
      title: "AI Mock Interviews",
      description: "Practice interviews with AI-powered questions tailored to your skills and target role.",
    },
    {
      icon: Mic2,
      title: "Flexible Interview Modes",
      description: "Choose text, voice, or hybrid interviews and practice in the way that suits you.",
    },
    {
      icon: Target,
      title: "Performance Insights",
      description: "Understand your strengths and weaknesses through structured interview feedback.",
    },
  ];

  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link to="/" className="home-brand">
          <span className="brand-icon">
            <BrainCircuit size={22} />
          </span>
          <span>Skill<span className="brand-accent">Arena</span></span>
        </Link>

        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="home-nav-actions">
          <Link to="/login" className="nav-login">Log in</Link>
          <Link to="/register" className="button button-primary nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={15} />
            AI-POWERED INTERVIEW PREPARATION
          </div>

          <h1>
            Your next opportunity
            <br />
            starts with <span>preparation.</span>
          </h1>

          <p className="hero-description">
            Build confidence, sharpen your skills, and prepare for your
            next interview with an intelligent interview preparation
            platform designed around you.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="button button-primary hero-cta">
              Start preparing <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="button button-secondary">
              I already have an account
            </Link>
          </div>

          <div className="hero-note">
            <Zap size={14} />
            Practice smarter. Improve consistently. Perform confidently.
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="visual-card">
            <div className="visual-card-header">
              <span className="status-dot" />
              SKILLARENA AI
              <span className="visual-live">PREPARATION MODE</span>
            </div>

            <div className="visual-brain">
              <BrainCircuit size={74} strokeWidth={1.1} />
              <div className="brain-spark">✦</div>
            </div>

            <p className="visual-question">Ready to level up?</p>
            <p className="visual-subtitle">
              Your personalized preparation journey begins here.
            </p>

            <div className="visual-progress">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="visual-footer">
              <span>LEARN</span>
              <span>PRACTICE</span>
              <span>IMPROVE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-eyebrow">YOUR PREPARATION TOOLKIT</span>
          <h2>Everything you need to move forward.</h2>
          <p>
            One platform to understand your profile, practice interviews,
            and continuously improve your performance.
          </p>
        </div>

        <div className="features-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={23} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <ArrowRight className="feature-arrow" size={18} />
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <span className="section-eyebrow">THE PROCESS</span>
        <h2>Prepare with purpose.</h2>
        <p>Build your confidence one step at a time.</p>

        <div className="steps-grid">
          <div className="step-item">
            <span>01</span>
            <h3>Build your profile</h3>
            <p>Upload your resume and understand your current skills.</p>
          </div>
          <div className="step-item">
            <span>02</span>
            <h3>Practice interviews</h3>
            <p>Choose your interview mode and challenge yourself.</p>
          </div>
          <div className="step-item">
            <span>03</span>
            <h3>Improve performance</h3>
            <p>Review feedback and work on your improvement areas.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <Link to="/" className="home-brand">
          <BrainCircuit size={19} />
          Skill<span className="brand-accent">Arena</span>
        </Link>
        <p>Prepare with purpose. Perform with confidence.</p>
      </footer>
    </main>
  );
}

export default Home;
