import InterviewIntegrityMonitor from "../components/dashboard/InterviewIntegrityMonitor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Headphones,
  LoaderCircle, Maximize2, Mic, ShieldCheck, Sparkles, Volume2
} from "lucide-react";
import {
  completeInterview, getInterviewError, getInterviewSession,
  submitInterviewAnswer, terminateInterview, recordIntegrityEvent
} from "../services/interviewService";

const SpeechRecognitionApi = () => typeof window === "undefined"
  ? null
  : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [focusReady, setFocusReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [voiceStarted, setVoiceStarted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [integrityReady, setIntegrityReady] = useState(false);
  const integrityCountRef = useRef(0);
  const [integrityWarningCount, setIntegrityWarningCount] = useState(0);
  const integrityTerminatedRef = useRef(false);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const pendingSubmitRef = useRef(false);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const busyRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const maxAnswerTimerRef = useRef(null);
  const firstSpeechAtRef = useRef(0);
  const voiceActiveRef = useRef(false);

  const loadSession = useCallback(async () => {
    const data = await getInterviewSession(sessionId);
    setSession(data);
    return data;
  }, [sessionId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getInterviewSession(sessionId);
        if (active) {
          setSession(data);
          if (data.status === "IN_PROGRESS") setFocusReady(false);
        }
      } catch (e) {
        if (active) setError(getInterviewError(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sessionId]);

  const questions = session?.questions || [];
  const answeredCount = questions.filter(q => q.status === "ANSWERED").length;
  const currentQuestion = questions.find(q => q.status !== "ANSWERED") || null;
  const progress = questions.length ? Math.round(answeredCount / questions.length * 100) : 0;
  const isCompleted = session?.status === "COMPLETED";
  const isTerminated = session?.status === "TERMINATED";
  const score = useMemo(() => Number(session?.score || 0).toFixed(1), [session?.score]);

  const stopVoice = useCallback(() => {
    shouldListenRef.current = false;
    pendingSubmitRef.current = false;
    window.clearTimeout(silenceTimerRef.current);
    window.clearTimeout(maxAnswerTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }, []);


  const handleIntegrityTermination = useCallback(async (reason) => {
    if (integrityTerminatedRef.current) return;
    integrityTerminatedRef.current = true;
    voiceActiveRef.current = false;
    stopVoice();
    try {
      const ended = await terminateInterview(sessionId, reason || "Repeated integrity warnings");
      setSession(ended);
    } catch (e) { setError(getInterviewError(e)); }
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    setFocusReady(false);
  }, [sessionId, stopVoice]);

  const registerIntegrityWarning = useCallback((reason) => {
    integrityCountRef.current += 1;
    setIntegrityWarningCount(integrityCountRef.current);
    const eventType = typeof reason === "string" ? "BROWSER_RESTRICTION" : reason?.type || "CAMERA_INTEGRITY_SIGNAL";
    const serious = typeof reason !== "string" && ["PHONE_DETECTED", "MULTIPLE_FACES", "CAMERA_TAMPERED"].includes(eventType);
    const event = {
      eventType,
      severity: serious ? "HIGH" : "WARNING",
      details: typeof reason === "string" ? reason : reason?.message || "Integrity signal detected"
    };
    recordIntegrityEvent(sessionId, event).then((updated) => {
      if (updated?.status === "TERMINATED") {
        setSession(updated);
        handleIntegrityTermination(event.details);
      }
    }).catch(() => {});
    if (serious || integrityCountRef.current >= 3) handleIntegrityTermination(serious ? `Serious integrity event: ${event.details}` : event.details);
  }, [handleIntegrityTermination, sessionId]);

  const submitSpokenAnswer = useCallback(async (spokenText) => {
    if (!currentQuestion || !spokenText.trim() || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setVoiceStatus("processing");
    try {
      await submitInterviewAnswer(sessionId, currentQuestion.id, spokenText.trim());
      const updated = await getInterviewSession(sessionId);
      setSession(updated);
      transcriptRef.current = "";
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      setTranscript("");
      if (updated.status === "COMPLETED") {
        setVoiceStatus("finished");
        stopVoice();
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        setFocusReady(false);
      } else {
        setVoiceStatus("speaking");
      }
    } catch (e) {
      setError(getInterviewError(e));
      setVoiceStatus("ready");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [currentQuestion, sessionId, stopVoice]);

  const startListening = useCallback(() => {
    const Recognition = SpeechRecognitionApi();
    if (!Recognition) {
      setVoiceError("Speech recognition is not available in this browser. Use the latest desktop Chrome or Microsoft Edge.");
      setVoiceStatus("error");
      shouldListenRef.current = false;
      return;
    }
    if (!shouldListenRef.current || recognitionRef.current || busyRef.current) return;
    try {
      const recognition = new Recognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => { setVoiceStatus("listening"); setVoiceError(""); };
      recognition.onresult = (event) => {
        if (!firstSpeechAtRef.current) {
          firstSpeechAtRef.current = Date.now();
          maxAnswerTimerRef.current = window.setTimeout(() => {
            if (transcriptRef.current.trim() && !pendingSubmitRef.current) {
              pendingSubmitRef.current = true;
              shouldListenRef.current = false;
              try { recognitionRef.current?.stop(); } catch { /* recognition may already have ended */ }
            }
          }, 120000);
        }
        window.clearTimeout(silenceTimerRef.current);
        // SpeechRecognition returns an indexed result list. Only consume changed
        // results; rebuilding the entire list on each event can duplicate or drop text
        // when Chrome restarts its recognition service.
        for (let i = event.resultIndex ?? 0; i < event.results.length; i += 1) {
          const result = event.results[i];
          const phrase = result?.[0]?.transcript?.trim();
          if (!phrase) continue;
          if (result.isFinal) {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${phrase}`.trim();
            interimTranscriptRef.current = "";
          } else {
            interimTranscriptRef.current = phrase;
          }
        }
        const nextTranscript = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
        transcriptRef.current = nextTranscript;
        setTranscript(nextTranscript);
        silenceTimerRef.current = window.setTimeout(() => {
          if (transcriptRef.current.trim() && !pendingSubmitRef.current) {
            pendingSubmitRef.current = true;
            shouldListenRef.current = false;
            try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
          }
        }, 2200);
      };
      recognition.onerror = (event) => {
        const messages = {
          "not-allowed": "Microphone access was blocked. Allow microphone access for localhost in Chrome site settings.",
          "service-not-allowed": "The browser speech service is blocked. Check browser permissions and try again.",
          "audio-capture": "No working microphone was found. Check your Windows input device.",
          network: "Chrome's speech recognition service could not connect. Check internet access and retry.",
          "no-speech": "No speech was detected. You can continue speaking.",
          aborted: "Speech capture was interrupted. Restarting the microphone…"
        };
        if (event.error === "no-speech" || event.error === "aborted") {
          setVoiceError("");
          return;
        }
        setVoiceError(messages[event.error] || `Speech recognition failed (${event.error || "unknown error"}).`);
        if (["not-allowed", "service-not-allowed", "audio-capture", "network"].includes(event.error)) {
          shouldListenRef.current = false;
          setVoiceStatus("error");
        }
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) recognitionRef.current = null;
        if (pendingSubmitRef.current) {
          pendingSubmitRef.current = false;
          window.clearTimeout(silenceTimerRef.current);
          window.clearTimeout(maxAnswerTimerRef.current);
          firstSpeechAtRef.current = 0;
          const spoken = transcriptRef.current;
          if (spoken.trim()) submitSpokenAnswer(spoken);
          else { setVoiceStatus("ready"); setVoiceError("I didn't catch an answer. Start speaking and try again."); }
          return;
        }
        if (shouldListenRef.current && !busyRef.current) {
          window.setTimeout(() => {
            if (shouldListenRef.current && !recognitionRef.current && !pendingSubmitRef.current) startListening();
          }, 350);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      recognitionRef.current = null;
      shouldListenRef.current = false;
      setVoiceError(e?.name === "InvalidStateError" ? "The microphone is already starting. Wait a moment and try again." : e?.message || "The browser could not start speech recognition.");
      setVoiceStatus("error");
    }
  }, [submitSpokenAnswer]);

  useEffect(() => {
    if (!voiceStarted || !focusReady || !integrityReady || !currentQuestion || isCompleted || isTerminated || busy) return;
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    transcriptRef.current = "";
    setTranscript("");
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.lang = "en-IN";
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onstart = () => setVoiceStatus("speaking");
    utterance.onend = () => {
      if (voiceActiveRef.current && !busyRef.current) {
        shouldListenRef.current = true;
        startListening();
      }
    };
    utterance.onerror = () => {
      setVoiceError("The interviewer voice could not start. Check your browser's speech settings.");
      setVoiceStatus("error");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => { utterance.onend = null; window.speechSynthesis.cancel(); };
  }, [currentQuestion?.id, voiceStarted, focusReady, integrityReady, isCompleted, isTerminated, busy, startListening]);

  useEffect(() => {
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);


  useEffect(() => {
    if (!focusReady || isCompleted || isTerminated) return;
    const onVisibility = () => {
      if (document.hidden) {
        handleIntegrityTermination("Interview automatically submitted because the candidate switched away from the interview tab.");
      }
    };
    const onBlur = () => {
      // Window blur alone can occur for benign browser/OS focus changes. The
      // visibility event is the reliable signal for switching tabs or minimizing.
    };
    const onFullscreenExit = () => {
      if (!document.fullscreenElement) {
        registerIntegrityWarning("Exited fullscreen mode");
        stopVoice();
        voiceActiveRef.current = false;
        setIntegrityReady(false);
        setFocusReady(false);
      }
    };
    const block = (event, reason) => { event.preventDefault(); registerIntegrityWarning(reason); };
    const onCopy = (event) => block(event, "Clipboard copy blocked");
    const onCut = (event) => block(event, "Clipboard cut blocked");
    const onPaste = (event) => block(event, "Clipboard paste blocked");
    const onContext = (event) => block(event, "Context menu blocked");
    const onKeyDown = (event) => {
      const key = (event.key || "").toLowerCase();
      const blockedCombo = (event.ctrlKey || event.metaKey) && ["c", "x", "v", "a", "p", "s", "r", "w", "t", "l"].includes(key);
      const blockedNav = event.altKey && ["arrowleft", "arrowright"].includes(key);
      const blockedReload = key === "f5" || (event.ctrlKey && key === "r");
      if (blockedCombo || blockedNav || blockedReload || key === "escape") {
        event.preventDefault();
        event.stopPropagation();
        if (blockedCombo && ["c", "x", "v"].includes(key)) registerIntegrityWarning(`Blocked keyboard clipboard shortcut: ${key.toUpperCase()}`);
        else if (key === "escape") registerIntegrityWarning("Attempted to exit fullscreen focus mode");
      }
    };
    const onPopState = () => {
      window.history.pushState({ interviewLock: true }, "", window.location.href);
      registerIntegrityWarning("Attempted to navigate away from the active interview");
    };
    let exitSubmissionSent = false;
    const submitOnPageExit = () => {
      if (exitSubmissionSent || isCompleted || isTerminated) return;
      exitSubmissionSent = true;
      // Best-effort server-side termination on tab/window close. Browsers may
      // cancel network activity during shutdown; pagehide + keepalive improves
      // delivery but cannot make it mathematically guaranteed.
      try {
        const saved = sessionStorage.getItem("skillarena_session");
        const token = saved ? JSON.parse(saved)?.token : null;
        const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
        if (token) {
          fetch(`${base}/interviews/session/${sessionId}/terminate`, {
            method: "POST", keepalive: true,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reason: "Interview automatically submitted because the interview tab or window was closed." })
          }).catch(() => {});
        }
      } catch { /* browser shutdown may prevent network completion */ }
    };
    const onBeforeUnload = () => submitOnPageExit();
    const onPageHide = () => submitOnPageExit();
    window.history.pushState({ interviewLock: true }, "", window.location.href);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenExit);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenExit);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [focusReady, isCompleted, isTerminated, handleIntegrityTermination, registerIntegrityWarning, stopVoice, sessionId]);

  useEffect(() => () => {
    voiceActiveRef.current = false;
    stopVoice();
  }, [stopVoice]);

  async function enterFocusMode() {
    setBusy(true); setError(""); setVoiceError("");
    try {
      if (!window.speechSynthesis || !SpeechRecognitionApi()) {
        throw new Error("Voice interview requires the latest desktop Chrome or Microsoft Edge.");
      }
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera and microphone access require localhost or a secure HTTPS connection.");
      if (!document.fullscreenElement) {
        if (!document.documentElement.requestFullscreen) throw new Error("Fullscreen is not supported by this browser.");
        await document.documentElement.requestFullscreen();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      stream.getTracks().forEach(track => track.stop());
      setIsFullscreen(Boolean(document.fullscreenElement));
      setIntegrityReady(false);
      setFocusReady(true);
      setVoiceStarted(true);
      voiceActiveRef.current = true;
      setVoiceStatus("ready");
    } catch (e) {
      setVoiceError(e?.name === "NotAllowedError" ? "Microphone permission was denied. Allow it using the icon beside the browser address bar." : e?.name === "NotFoundError" ? "No microphone was found. Connect a microphone and try again." : e?.name === "NotReadableError" ? "The microphone is busy. Close apps such as Teams or Zoom and retry." : e?.message || "Could not enter interview focus mode.");
    } finally { setBusy(false); }
  }

  function retryVoice() {
    setVoiceError("");
    shouldListenRef.current = true;
    startListening();
  }

  async function finishInterview() {
    if (answeredCount !== questions.length || !questions.length) return;
    setBusy(true); setError("");
    try {
      const result = await completeInterview(sessionId);
      setSession(result);
      setVoiceStatus("finished");
      voiceActiveRef.current = false;
      stopVoice();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      setFocusReady(false);
    } catch (e) { setError(getInterviewError(e)); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="sa-nexora-room"><div className="sa-nexora-state"><LoaderCircle className="sa-spin"/> Preparing your interview...</div></main>;
  if (!session) return <main className="sa-nexora-room"><div className="sa-nexora-alert"><AlertCircle/> {error || "Interview session could not be found."}</div><button className="sa-nexora-button secondary" onClick={() => navigate("/dashboard/interviews")}>Back to interviews</button></main>;

  if (!isCompleted && !isTerminated && !focusReady) return (
    <main className="sa-nexora-gate">
      <div className="sa-nexora-gate-orbit"><div><ShieldCheck size={34}/></div></div>
      <div className="sa-nexora-eyebrow">SKILLARENA SECURE INTERVIEW SPACE</div>
      <h1>Ready to begin?</h1>
      <p>Your voice interview will start in fullscreen. The interviewer will speak each question, then listen to your spoken answer automatically.</p>
      <div className="sa-nexora-gate-checks"><span><ShieldCheck size={15}/> Fullscreen focus</span><span><Mic size={15}/> Microphone required</span><span><ShieldCheck size={15}/> Camera monitoring required</span><span><Sparkles size={15}/> AI interviewer ready</span></div>
      {error && <div className="sa-nexora-alert"><AlertCircle size={17}/>{error}</div>}
      {voiceError && <div className="sa-nexora-alert"><AlertCircle size={17}/>{voiceError}</div>}
      <button className="sa-nexora-button primary" onClick={enterFocusMode} disabled={busy}>{busy ? <LoaderCircle className="sa-spin" size={17}/> : <Maximize2 size={17}/>} {busy ? "Preparing voice interview..." : "Enter fullscreen & start voice interview"}</button>
      <div className="sa-nexora-gate-back">Your dashboard and account controls are unavailable during the interview.</div>
      <small>Voice input uses browser speech recognition. Only the recognized text answer is sent to SkillArena; raw audio is not uploaded by this page. Use a recent desktop Chrome or Edge browser.</small>
    </main>
  );

  return (
    <main className="sa-nexora-room">
      <header className="sa-nexora-topline">
        <div><div className="sa-nexora-eyebrow">LIVE VOICE INTERVIEW</div><h1>AI Interview Session</h1><p>Session #{session.id} · {session.status.replaceAll("_", " ")}</p></div>
        <div className="sa-nexora-top-actions"><span className="sa-nexora-focus"><ShieldCheck size={15}/> {isFullscreen ? "Focus mode active" : "Fullscreen exited"}</span><span className="sa-nexora-focus">Warnings {integrityWarningCount}/3</span></div>
      </header>

      {error && <div className="sa-nexora-alert"><AlertCircle size={17}/>{error}</div>}
      {!isCompleted && !isTerminated && <section className="sa-nexora-progress"><div><span>Interview progress</span><strong>{answeredCount} <small>/ {questions.length} questions</small></strong></div><div className="sa-nexora-progress-track"><span style={{ width: `${progress}%` }}/></div></section>}

      {(isCompleted || isTerminated) ? (
        <section className="sa-nexora-finish">
          <div className="sa-nexora-finish-icon"><CheckCircle2 size={32}/></div>
          <div className="sa-nexora-eyebrow">{isTerminated ? "SESSION TERMINATED" : "SESSION COMPLETE"}</div>
          <h2>{isTerminated ? "This interview has ended." : "You have completed this interview."}</h2>
          <p>{isTerminated
            ? `This session was submitted automatically. Reason: ${session.terminationReason || session.feedback || "Integrity policy triggered"}. The evaluation of submitted answers is available in your report.`
            : "Your interview has been completed and evaluated. Your evaluation summary is ready."}</p>
          <div className="sa-nexora-score"><strong>{score}</strong><span>{isTerminated ? "/ 10 partial average" : "/ 10 average score"}</span></div>
          <div className="sa-nexora-result-summary">
            <div><span>FINAL STATUS</span><strong>{isTerminated ? "Automatically terminated" : "Successfully completed"}</strong></div>
            {isTerminated && <div><span>TERMINATION REASON</span><strong>{session.terminationReason || session.feedback || "Integrity policy triggered"}</strong></div>}
            <div><span>EVALUATION</span><strong>{session.evaluation?.feedback || session.evaluationFeedback || session.overallFeedback || (isTerminated ? "Submitted answers were evaluated. Open your report for the evaluation details." : "Your interview evaluation has been saved.")}</strong></div>
          </div>
          <Link className="sa-nexora-button primary" to="/dashboard/reports">View interview evaluation <ArrowRight size={16}/></Link>
        </section>
      ) : !currentQuestion && questions.length > 0 ? (
        <section className="sa-nexora-live-card sa-nexora-all-answered">
          <div className="sa-nexora-finish-icon"><CheckCircle2 size={30}/></div>
          <div className="sa-nexora-eyebrow">ALL ANSWERS SUBMITTED</div>
          <h2>You're ready to complete the interview.</h2>
          <p>Every question has been answered and evaluated. Complete the session to save your final result.</p>
          <button className="sa-nexora-button primary" onClick={finishInterview} disabled={busy}>{busy ? <LoaderCircle className="sa-spin" size={16}/> : <CheckCircle2 size={16}/>} Complete interview</button>
        </section>
      ) : currentQuestion ? (
        <section className="sa-nexora-live-card">
          <InterviewIntegrityMonitor onReady={() => setIntegrityReady(true)} onWarning={(event) => registerIntegrityWarning(event)} onTerminated={(event) => handleIntegrityTermination(event.reason)} />
          <div className="sa-nexora-question-head"><span>{currentQuestion.followUp ? "ADAPTIVE FOLLOW-UP" : `QUESTION ${currentQuestion.questionOrder} OF ${questions.length}`}</span><span>{currentQuestion.status === "ANSWERED" ? "ANSWERED" : "LIVE"}</span></div>
          <div className={`sa-nexora-voice-orb ${voiceStatus === "speaking" ? "speaking" : voiceStatus === "listening" ? "listening" : ""}`}>
            {voiceStatus === "speaking" ? <Volume2 size={32}/> : voiceStatus === "processing" ? <LoaderCircle className="sa-spin" size={32}/> : <Mic size={32}/>}
          </div>
          <div className="sa-nexora-voice-state">{voiceStatus === "speaking" ? "AI INTERVIEWER IS SPEAKING" : voiceStatus === "listening" ? "LISTENING TO YOUR ANSWER" : voiceStatus === "processing" ? "PROCESSING YOUR ANSWER" : voiceStatus === "error" ? "VOICE INPUT NEEDS ATTENTION" : "VOICE INTERVIEW READY"}</div>
          <h2>{currentQuestion.questionText}</h2>
          <div className="sa-nexora-transcript"><div>LIVE TRANSCRIPT</div><p>{transcript || (voiceStatus === "listening" ? "I'm listening..." : "Your spoken answer will appear here.")}</p></div>
          {voiceError && <div className="sa-nexora-alert"><AlertCircle size={16}/>{voiceError}</div>}
          <div className="sa-nexora-live-footer">
            <span>{voiceStatus === "listening" ? "Your answer submits after 2 seconds of silence (maximum 2 minutes)." : voiceStatus === "processing" ? "Submitting your response securely..." : "The interviewer will listen automatically after asking the question."}</span>
            {voiceStatus === "error" && <button className="sa-nexora-button secondary" onClick={retryVoice}><Mic size={15}/> Try microphone again</button>}
          </div>
        </section>
      ) : <div className="sa-nexora-state">No questions were returned for this interview. Return to Interviews and start another session.</div>}
      <footer className="sa-nexora-footnote"><Headphones size={15}/> Speak naturally and explain your reasoning. Follow-up questions may be generated from your answers. Scores and feedback are revealed only after the interview ends.</footer>
    </main>
  );
}
