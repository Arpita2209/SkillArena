import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BrainCircuit, CheckCircle2, Clock3, Code2, LoaderCircle,
  Plus, RefreshCw, Sparkles, Target, TriangleAlert
} from "lucide-react";
import {
  getInterviewConfigs, getInterviewError, saveInterviewConfig, startInterview
} from "../services/interviewService";

const INITIAL_FORM = {
  interviewType: "Technical",
  programmingLanguage: "Java",
  difficulty: "Intermediate",
  numberOfQuestions: 5,
};

const TYPE_OPTIONS = ["Technical", "HR", "Mixed"];
const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGE_OPTIONS = ["Java", "JavaScript", "Python", "C", "C++", "SQL", "Other"];

function formatDate(value) {
  if (!value) return "Recently created";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently created"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInterviewConfigs();
      setConfigs(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (requestError) {
      setError(getInterviewError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: name === "numberOfQuestions" ? Number(value) : value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveInterviewConfig(form);
      setConfigs(current => [saved, ...current.filter(item => item.id !== saved.id)]);
      setNotice("Your interview configuration has been saved.");
    } catch (requestError) {
      setError(getInterviewError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(configId) {
    setStartingId(configId);
    setError("");
    setNotice("");
    try {
      const session = await startInterview(configId);
      if (!session?.id) throw new Error("The backend created a session but did not return its ID.");
      navigate(`/dashboard/interviews/session/${session.id}`);
    } catch (requestError) {
      setError(getInterviewError(requestError));
    } finally {
      setStartingId(null);
    }
  }

  return (
    <main className="sa-interview-page">
      <header className="sa-interview-heading">
        <div>
          <div className="sa-eyebrow"><Sparkles size={14} /> AI INTERVIEW PRACTICE</div>
          <h1>Prepare with purpose.</h1>
          <p>Set up a focused practice session tailored to the role and skills you want to strengthen.</p>
        </div>
        <div className="sa-interview-heading-icon"><BrainCircuit size={30} /></div>
      </header>

      {error && <div className="sa-interview-alert error" role="alert"><TriangleAlert size={17} /><span>{error}</span></div>}
      {notice && <div className="sa-interview-alert success" role="status"><CheckCircle2 size={17} /><span>{notice}</span></div>}

      <div className="sa-interview-layout">
        <section className="sa-interview-card sa-config-card">
          <div className="sa-interview-card-heading">
            <div><span className="sa-card-kicker">NEW PRACTICE SESSION</span><h2>Interview configuration</h2><p>Choose your practice preferences to get started.</p></div>
            <span className="sa-card-heading-icon"><Target size={19} /></span>
          </div>

          <form onSubmit={handleSave} className="sa-config-form">
            <label className="sa-form-field">
              <span>Interview type</span>
              <select name="interviewType" value={form.interviewType} onChange={updateField} required>
                {TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <small>Choose the style of interview you want to practise.</small>
            </label>

            <label className="sa-form-field">
              <span>Programming language / domain</span>
              <select name="programmingLanguage" value={form.programmingLanguage} onChange={updateField} required>
                {LANGUAGE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <small>For HR or mixed interviews, select the most relevant domain.</small>
            </label>

            <label className="sa-form-field">
              <span>Difficulty level</span>
              <select name="difficulty" value={form.difficulty} onChange={updateField} required>
                {DIFFICULTY_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label className="sa-form-field">
              <span>Number of questions</span>
              <select name="numberOfQuestions" value={form.numberOfQuestions} onChange={updateField} required>
                {[5, 10, 15, 20].map(value => <option key={value} value={value}>{value} questions</option>)}
              </select>
              <small>Choose between 5 and 20 questions.</small>
            </label>

            <div className="sa-config-summary">
              <div><Clock3 size={16} /><span>Question count</span><strong>{form.numberOfQuestions}</strong></div>
              <div><Code2 size={16} /><span>Focus area</span><strong>{form.programmingLanguage}</strong></div>
            </div>

            <button className="sa-interview-submit" type="submit" disabled={saving}>
              {saving ? <><LoaderCircle className="sa-spin" size={17} /> Saving configuration...</> : <><Plus size={17} /> Save configuration</>}
            </button>
          </form>
        </section>

        <aside className="sa-interview-side">
          <section className="sa-interview-card sa-guidance-card">
            <span className="sa-card-kicker">A BETTER PRACTICE ROUTINE</span>
            <h3>Make every session count.</h3>
            <p>Choose a difficulty that challenges you without making it difficult to learn from each answer.</p>
            <div className="sa-guidance-line"><span>01</span><p><strong>Be specific</strong>Pick a role or technical area to focus on.</p></div>
            <div className="sa-guidance-line"><span>02</span><p><strong>Think out loud</strong>Practise explaining your approach clearly.</p></div>
            <div className="sa-guidance-line"><span>03</span><p><strong>Review your feedback</strong>Use each session to identify what to improve.</p></div>
          </section>
        </aside>
      </div>

      <section className="sa-saved-configs">
        <div className="sa-saved-heading">
          <div><span className="sa-card-kicker">YOUR PRACTICE LIBRARY</span><h2>Saved configurations</h2><p>Reuse a setup whenever you're ready for another session.</p></div>
          <button type="button" className="sa-refresh-button" onClick={loadConfigs} disabled={loading} aria-label="Refresh saved configurations"><RefreshCw size={16} className={loading ? "sa-spin" : ""} /> Refresh</button>
        </div>

        {loading ? (
          <div className="sa-config-empty"><LoaderCircle className="sa-spin" size={20} /> Loading your configurations...</div>
        ) : configs.length === 0 ? (
          <div className="sa-config-empty"><BrainCircuit size={23} /><strong>No saved configurations yet</strong><span>Create your first setup using the form above.</span></div>
        ) : (
          <div className="sa-config-grid">
            {configs.map(config => (
              <article className="sa-saved-config" key={config.id}>
                <div className="sa-saved-config-top"><span className="sa-config-type">{config.interviewType}</span><small>{formatDate(config.createdAt)}</small></div>
                <h3>{config.programmingLanguage} interview</h3>
                <div className="sa-config-tags"><span>{config.difficulty}</span><span>{config.numberOfQuestions} questions</span></div>
                <button type="button" className="sa-start-button" onClick={() => handleStart(config.id)} disabled={startingId !== null}>
                  {startingId === config.id ? <><LoaderCircle className="sa-spin" size={15} /> Starting...</> : <>Start interview <ArrowRight size={15} /></>}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
