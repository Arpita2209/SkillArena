import { useRef, useState } from "react";
import { FileText, UploadCloud, FileCheck2, X, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function ResumeUpload() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");

  function chooseFile(candidate) {
    setError(""); setNotice("");
    if (!candidate) return;
    if (!ACCEPTED.includes(candidate.type) && !/\.(pdf|docx?)$/i.test(candidate.name)) {
      setError("Please choose a PDF, DOC or DOCX file."); return;
    }
    if (candidate.size > MAX_SIZE) { setError("The maximum file size is 10 MB."); return; }
    setFile(candidate);
    setNotice("File selected. Resume upload and AI analysis will become available when the backend endpoints are connected.");
  }

  return <main className="sa-work-page">
    <header className="sa-work-heading"><div><span className="sa-card-kicker">RESUME INTELLIGENCE</span><h1>Your experience, clearly presented.</h1><p>Prepare a stronger resume and make your skills easier for recruiters to understand.</p></div><span className="sa-work-heading-icon"><FileText size={27}/></span></header>
    <section className="sa-work-grid">
      <article className="sa-work-card sa-resume-upload-card">
        <div className="sa-work-card-head"><div><span className="sa-card-kicker">YOUR RESUME</span><h2>Upload your latest resume</h2><p>Choose a PDF or Word document to prepare it for analysis.</p></div><FileCheck2 size={22}/></div>
        <div className={`sa-dropzone ${dragging ? "dragging" : ""}`} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={e => e.key === "Enter" && inputRef.current?.click()} onDragOver={e => {e.preventDefault();setDragging(true);}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault();setDragging(false);chooseFile(e.dataTransfer.files?.[0]);}}>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={e => chooseFile(e.target.files?.[0])}/>
          <span className="sa-drop-icon"><UploadCloud size={26}/></span><strong>Drop your resume here</strong><span>or <u>browse files</u></span><small>PDF, DOC or DOCX · Up to 10 MB</small>
        </div>
        {file && <div className="sa-selected-file"><FileText size={19}/><div><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · Selected on this device</small></div><button type="button" aria-label="Remove selected file" onClick={() => {setFile(null);setNotice("");if(inputRef.current)inputRef.current.value="";}}><X size={17}/></button></div>}
        {error && <p className="sa-inline-alert error"><AlertCircle size={15}/>{error}</p>}
        {notice && <p className="sa-inline-alert"><ShieldCheck size={15}/>{notice}</p>}
        <button className="sa-work-primary" type="button" disabled={!file} onClick={() => setNotice("Your file is selected locally only. No file has been sent to a server.")}>Prepare resume analysis <Sparkles size={16}/></button>
        <p className="sa-muted-note">Privacy: selecting a file does not upload it. Server-side storage and AI analysis require a resume API from the backend.</p>
      </article>
      <aside className="sa-work-card sa-resume-aside"><span className="sa-card-kicker">WHAT YOU'LL GET</span><h2>A clearer picture of your profile.</h2><div className="sa-feature-line"><i>01</i><div><strong>Resume quality review</strong><p>Structure, clarity, formatting and readability.</p></div></div><div className="sa-feature-line"><i>02</i><div><strong>Skills and keyword insights</strong><p>Identify relevant skills and missing role keywords.</p></div></div><div className="sa-feature-line"><i>03</i><div><strong>Actionable improvements</strong><p>Suggestions to strengthen project and experience descriptions.</p></div></div><div className="sa-coming-note">Backend integration needed for persistent uploads and AI-generated results.</div></aside>
    </section>
  </main>;
}
