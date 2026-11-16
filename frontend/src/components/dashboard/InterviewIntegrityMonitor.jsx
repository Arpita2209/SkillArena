import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ShieldAlert, ShieldCheck, LoaderCircle } from "lucide-react";

const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const OBJECT_MODEL = "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite";
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

/**
 * Local-first browser integrity monitor. Camera frames are processed in-browser,
 * never recorded or uploaded. Detection signals are heuristic, not proof of misconduct.
 */
export default function InterviewIntegrityMonitor({ onTerminated, onWarning, onReady }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceRef = useRef(null);
  const objectRef = useRef(null);
  const rafRef = useRef(0);
  const warningCountRef = useRef(0);
  const eventTimesRef = useRef({});
  const [status, setStatus] = useState("starting");
  const [message, setMessage] = useState("Starting local camera checks…");
  const [warning, setWarning] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [position, setPosition] = useState({ x: null, y: 18 });
  const dragRef = useRef(null);
  const [phoneStatus, setPhoneStatus] = useState("Loading phone detection…");
  const [microphoneStatus, setMicrophoneStatus] = useState("Microphone check starting…");
  const terminatedRef = useRef(false);
  const onTerminatedRef = useRef(onTerminated);
  const onWarningRef = useRef(onWarning);
  const onReadyRef = useRef(onReady);
  onTerminatedRef.current = onTerminated;
  onWarningRef.current = onWarning;
  onReadyRef.current = onReady;

  useEffect(() => {
    let active = true;
    const report = (key, text) => {
      const now = Date.now();
      if (now - (eventTimesRef.current[key] || 0) < 8000) return;
      eventTimesRef.current[key] = now;
      warningCountRef.current += 1;
      setWarning(text);
      onWarningRef.current?.({ type: key, message: text, count: warningCountRef.current });
      if (warningCountRef.current >= 3 && !terminatedRef.current) {
        terminatedRef.current = true;
        setStatus("terminated");
        setMessage("Interview ended after repeated integrity warnings.");
        onTerminatedRef.current?.({ reason: "INTEGRITY_WARNING_THRESHOLD", warningCount: warningCountRef.current });
      }
    };

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS or localhost.");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        if (!active) { stream.getTracks().forEach(track => track.stop()); return; }
        streamRef.current = stream;
        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) throw new Error("A working microphone is required for this interview.");
        setMicrophoneStatus("Microphone active");
        audioTrack.addEventListener("mute", () => {
          setMicrophoneStatus("Microphone muted");
          report("MICROPHONE_MUTED", "Your microphone became muted or unavailable. Restore microphone access to continue.");
        });
        audioTrack.addEventListener("ended", () => {
          setMicrophoneStatus("Microphone disconnected");
          report("MICROPHONE_DISCONNECTED", "Your microphone disconnected during the interview.");
          onTerminatedRef.current?.({ reason: "MICROPHONE_DISCONNECTED" });
        });
        audioTrack.addEventListener("unmute", () => setMicrophoneStatus("Microphone active"));
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("loading");
        setMessage("Camera active. Loading local face and phone checks…");
        // Load MediaPipe from a version-pinned CDN so the browser performs inference locally.
        const vision = await import(/* @vite-ignore */ "https://esm.sh/@mediapipe/tasks-vision@0.10.14");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM);
        const face = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate: "CPU" },
          runningMode: "VIDEO", numFaces: 2
        });
        if (!active) { face.close(); return; }
        faceRef.current = face;
        try {
          objectRef.current = await vision.ObjectDetector.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: OBJECT_MODEL, delegate: "CPU" },
            runningMode: "VIDEO", scoreThreshold: 0.35, maxResults: 20
          });
          setPhoneStatus("Phone-object detection active");
        } catch {
          setPhoneStatus("Phone detection unavailable — other checks remain active");
        }
        setStatus("monitoring");
        setMessage("Camera and local attention checks are active.");
        onReadyRef.current?.();
        let faceMissingAt = 0;
        let gazeAwayAt = 0;
        let phoneAt = 0;
        let multiFaceAt = 0;
        let lastPhoneCheck = 0;

        const detect = () => {
          if (!active || terminatedRef.current || !videoRef.current || !faceRef.current) return;
          const video = videoRef.current;
          if (video.readyState >= 2) {
            const now = Date.now();
            const result = faceRef.current.detectForVideo(video, performance.now());
            const faces = result.faceLandmarks || [];
            if (!faces.length) {
              faceMissingAt ||= now;
              if (now - faceMissingAt > 4000) report("FACE_NOT_VISIBLE", "Your face has not been visible for several seconds. Please return to the camera.");
              gazeAwayAt = 0;
            } else {
              faceMissingAt = 0;
              if (faces.length > 1) {
                multiFaceAt ||= now;
                // A second detected face is a serious integrity event. Do not
                // wait for a multi-second warning window.
                if (now - multiFaceAt >= 350) {
                  terminatedRef.current = true;
                  setStatus("terminated");
                  setMessage("A second person was detected. The interview is being submitted.");
                  onTerminatedRef.current?.({ reason: "MULTIPLE_FACES_DETECTED" });
                  return;
                }
              } else multiFaceAt = 0;

              const points = faces[0];
              const leftIris = points[468], rightIris = points[473];
              const leftOuter = points[33], leftInner = points[133];
              const rightInner = points[362], rightOuter = points[263];
              const leftRatio = leftIris && leftOuter && leftInner ? Math.abs(leftIris.x-leftOuter.x)/Math.max(.001,Math.abs(leftInner.x-leftOuter.x)) : .5;
              const rightRatio = rightIris && rightInner && rightOuter ? Math.abs(rightIris.x-rightInner.x)/Math.max(.001,Math.abs(rightOuter.x-rightInner.x)) : .5;
              const verticalA = points[159], verticalB = points[145];
              const verticalC = points[386], verticalD = points[374];
              const verticalLeft = leftIris && verticalA && verticalB ? Math.abs(leftIris.y-verticalA.y)/Math.max(.001,Math.abs(verticalB.y-verticalA.y)) : .5;
              const verticalRight = rightIris && verticalC && verticalD ? Math.abs(rightIris.y-verticalC.y)/Math.max(.001,Math.abs(verticalD.y-verticalC.y)) : .5;
              const xs = points.map(p => p.x);
              const nose = points[1];
              const headRatio = nose ? (nose.x-Math.min(...xs))/Math.max(.001,Math.max(...xs)-Math.min(...xs)) : .5;
              const away = (leftRatio+rightRatio)/2 < .18 || (leftRatio+rightRatio)/2 > .82 ||
                (verticalLeft+verticalRight)/2 < .12 || (verticalLeft+verticalRight)/2 > .88 ||
                headRatio < .27 || headRatio > .73;
              if (away) {
                gazeAwayAt ||= now;
                if (now-gazeAwayAt > 5000) report("GAZE_AWAY", "Your face appears turned away from the screen. Please look toward the interviewer.");
              } else gazeAwayAt = 0;
            }
            if (objectRef.current && now-lastPhoneCheck > 700) {
              lastPhoneCheck = now;
              try {
                const detections = objectRef.current.detectForVideo(video, performance.now()).detections || [];
                const scores = detections.flatMap(d => (d.categories || [])
                  .filter(c => /cell phone|mobile phone|smartphone|phone/i.test(c.categoryName || ""))
                  .map(c => c.score || 0));
                const found = scores.some(score => score >= .35);
                if (found) {
                  phoneAt ||= now;
                  if (now-phoneAt > 1800) report("PHONE_DETECTED", "A possible phone was detected in the camera frame. Automated detection can be incorrect.");
                } else phoneAt = 0;
              } catch { /* frame-level detector errors are non-fatal */ }
            }
          }
          rafRef.current = requestAnimationFrame(detect);
        };
        rafRef.current = requestAnimationFrame(detect);
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error?.name === "NotAllowedError" ? "Camera permission denied. Allow camera access in browser settings." : error?.message || "Camera monitoring could not start.");
        onTerminatedRef.current?.({ reason: "CAMERA_MONITOR_UNAVAILABLE" });
      }
    };
    start();
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      faceRef.current?.close?.();
      objectRef.current?.close?.();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const beginDrag = (event) => {
    if (event.target.closest("button")) return;
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const nextLeft = Math.max(8, Math.min(window.innerWidth - 300, dragRef.current.left + event.clientX - dragRef.current.pointerX));
    const nextTop = Math.max(8, Math.min(window.innerHeight - 100, dragRef.current.top + event.clientY - dragRef.current.pointerY));
    setPosition({ x: nextLeft, y: nextTop });
  };
  const endDrag = () => { dragRef.current = null; };

  return (
    <aside className={`sa-integrity-widget ${expanded ? "expanded" : "collapsed"}`} style={position.x == null ? undefined : { left: position.x, top: position.y, right: "auto", bottom: "auto" }}>
      <div className="sa-integrity-head" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} title="Drag to move camera monitor">
        <span>{status === "monitoring" ? <ShieldCheck size={17}/> : status === "error" ? <CameraOff size={17}/> : <Camera size={17}/>}</span>
        <strong>Interview integrity</strong>
        <small className={status}>{status === "monitoring" ? "ACTIVE" : status.toUpperCase()}</small>
        <button type="button" onClick={() => setExpanded(v => !v)}>{expanded ? "Hide" : "Show"}</button>
      </div>
      <div className="sa-integrity-video-wrap">
        <video ref={videoRef} muted playsInline className="sa-integrity-video"/>
        {status === "starting" || status === "loading" ? <div className="sa-integrity-placeholder"><LoaderCircle className="sa-spin" size={18}/></div> : null}
      </div>
      {expanded && <div className="sa-integrity-details">
        <p>{message}</p><small>{microphoneStatus}</small><small>{phoneStatus}</small>
        {warning && <div role="status" className="sa-integrity-warning"><ShieldAlert size={15}/>{warning}</div>}
        <small className="sa-integrity-privacy">Local camera processing only. No video is recorded or uploaded. Face, gaze and phone detection are approximate and can produce false positives.</small>
      </div>}
    </aside>
  );
}
