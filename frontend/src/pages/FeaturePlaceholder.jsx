import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturePlaceholder({ eyebrow, title, description, status = "In development" }) {
  return (
    <main className="sa-feature-placeholder">
      <div className="sa-eyebrow"><Sparkles size={14} /> {eyebrow}</div>
      <section className="sa-placeholder-card">
        <span className="sa-placeholder-status">{status}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="sa-primary" to="/dashboard"><ArrowLeft size={16} /> Back to overview</Link>
      </section>
    </main>
  );
}
