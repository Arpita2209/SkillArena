package com.skillarena.Springboot.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.skillarena.Springboot.Entity.*;
import com.skillarena.Springboot.Repository.*;
import com.skillarena.Springboot.DTO.*;

@Service
public class InterviewSessionService {
 private final InterviewConfigRepo configRepo;
 private final InterviewSessionRepo sessionRepo;
 private final InterviewQuestionRepo questionRepo;
 private final AiQuestionService aiQuestionService;
 private final AiEvaluationService aiEvaluationService;
 private final InterviewIntegrityEventRepo integrityRepo;
 public InterviewSessionService(InterviewConfigRepo c, InterviewSessionRepo s, InterviewQuestionRepo q, AiQuestionService aq, AiEvaluationService ae, InterviewIntegrityEventRepo ir) { configRepo=c; sessionRepo=s; questionRepo=q; aiQuestionService=aq; aiEvaluationService=ae; integrityRepo=ir; }

 @Transactional
 public InterviewSessionResponse startInterview(Long configId, String email) {
  InterviewConfigEntity config=configRepo.findById(configId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Interview configuration not found"));
  if(!config.getUserEmail().equalsIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"You cannot use this configuration");
  List<String> prompts=parseQuestions(aiQuestionService.generateQuestions(config));
  if(prompts.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"AI did not return usable interview questions. Please try again.");
  InterviewSessionEntity session=new InterviewSessionEntity(); session.setUserEmail(email); session.setConfigId(configId); session.setQuestions(String.join("\n",prompts)); session.setAnswers(""); session.setScore(0.0); session.setFeedback("Interview in progress"); session.setStatus("IN_PROGRESS"); session.setCurrentQuestionIndex(0); session.setTotalQuestions(prompts.size());
  session=sessionRepo.save(session);
  int order=1;
  for(String prompt:prompts) { InterviewQuestionEntity q=new InterviewQuestionEntity(); q.setSession(session); q.setQuestionOrder(order++); q.setQuestionText(prompt); session.getQuestionItems().add(q); }
  session=sessionRepo.save(session);
  return InterviewSessionResponse.from(session);
 }

 @Transactional(readOnly=true)
 public InterviewSessionResponse getSession(Long id,String email) { return InterviewSessionResponse.from(requireSession(id,email)); }

 @Transactional
 public QuestionSubmissionResponse submitQuestion(Long sessionId, QuestionAnswerRequest request, String email) {
  InterviewSessionEntity session=requireSession(sessionId,email);
  if(!"IN_PROGRESS".equals(session.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT,"This interview is no longer active");
  InterviewQuestionEntity question=questionRepo.findByIdAndSession_Id(request.questionId(),sessionId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Question not found in this interview"));
  if("ANSWERED".equals(question.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT,"This question has already been answered");
  String evaluation=aiEvaluationService.evaluateAnswer(question.getQuestionText(),request.answer());
  double score=extractScore(evaluation);
  question.setAnswer(request.answer().trim()); question.setScore(score); question.setFeedback(evaluation); question.setStatus("ANSWERED"); question.setAnsweredAt(LocalDateTime.now()); questionRepo.save(question);
  boolean followUpAdded = false;
  {
   Long rootQuestionId = Boolean.TRUE.equals(question.getFollowUp()) && question.getParentQuestionId() != null
       ? question.getParentQuestionId() : question.getId();
   long depth = questionRepo.countByParentQuestionId(rootQuestionId);
   if (depth < 2) {
    String followUpText;
    try {
     followUpText = aiQuestionService.generateFollowUp(question.getQuestionText(), request.answer().trim(), (int) depth, 2);
    } catch (RuntimeException followUpError) {
     // The candidate's submitted answer must remain saved even if adaptive prompting fails.
     followUpText = "NO_FOLLOW_UP";
    }
    if (followUpText != null && !followUpText.equalsIgnoreCase("NO_FOLLOW_UP")) {
     InterviewQuestionEntity followUp = new InterviewQuestionEntity();
     followUp.setSession(session);
     followUp.setQuestionOrder(session.getTotalQuestions() + 1);
     followUp.setQuestionText(followUpText);
     followUp.setFollowUp(true);
     followUp.setFollowUpDepth((int) depth + 1);
     followUp.setParentQuestionId(rootQuestionId);
     questionRepo.save(followUp);
     session.setTotalQuestions(session.getTotalQuestions() + 1);
     followUpAdded = true;
    }
   }
  }
  List<InterviewQuestionEntity> all=questionRepo.findBySession_IdOrderByQuestionOrderAsc(sessionId);
  int next=(int)all.stream().filter(q->"ANSWERED".equals(q.getStatus())).count();
  session.setCurrentQuestionIndex(next);
  session.setAnswers(all.stream().filter(q->q.getAnswer()!=null).map(q->"Q"+q.getQuestionOrder()+": "+q.getAnswer()).reduce((a,b)->a+"\\n\\n"+b).orElse(""));
  session.setScore(all.stream().filter(q->q.getScore()!=null).mapToDouble(InterviewQuestionEntity::getScore).average().orElse(0));
  session.setFeedback("Answered "+next+" of "+session.getTotalQuestions()+" questions");
  sessionRepo.save(session);
  boolean done=next>=session.getTotalQuestions();
  return new QuestionSubmissionResponse(sessionId,question.getId(),question.getStatus(),next,session.getTotalQuestions(),done,followUpAdded);
 }

 @Transactional
 public InterviewSessionResponse completeInterview(Long id,String email) {
  InterviewSessionEntity session=requireSession(id,email);
  if (!"IN_PROGRESS".equals(session.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This interview is no longer active");
  long answered=questionRepo.countBySession_IdAndStatus(id,"ANSWERED");
  if(answered<session.getTotalQuestions()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Answer all questions before completing the interview");
  List<InterviewQuestionEntity> qs=questionRepo.findBySession_IdOrderByQuestionOrderAsc(id);
  double average=qs.stream().filter(q->q.getScore()!=null).mapToDouble(InterviewQuestionEntity::getScore).average().orElse(0);
  session.setScore(Math.round(average*100.0)/100.0); session.setStatus("COMPLETED"); session.setCompletedAt(LocalDateTime.now()); session.setFeedback("Interview completed. Final score: "+session.getScore()+" / 10");
  return InterviewSessionResponse.from(sessionRepo.save(session));
 }


 @Transactional
 public InterviewSessionResponse recordIntegrityEvent(Long id, String email, IntegrityEventRequest request) {
  InterviewSessionEntity session = requireSession(id, email);
  if (!"IN_PROGRESS".equals(session.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Interview is not active");
  InterviewIntegrityEventEntity event = new InterviewIntegrityEventEntity();
  event.setSessionId(id);
  event.setUserEmail(email);
  event.setEventType(request.eventType());
  event.setSeverity(request.severity());
  event.setDetails(request.details());
  integrityRepo.save(event);
  long count = integrityRepo.countBySessionIdAndUserEmail(id, email);
  boolean serious = "HIGH".equalsIgnoreCase(request.severity()) || "CRITICAL".equalsIgnoreCase(request.severity());
  if (serious) return terminateInterview(id, email, "Serious integrity event: " + request.eventType());
  if (count >= 3) return terminateInterview(id, email, "Maximum of three integrity warnings reached");
  return InterviewSessionResponse.from(session);
 }

 @Transactional
 public InterviewSessionResponse terminateInterview(Long id, String email, String reason) {
  InterviewSessionEntity session = requireSession(id, email);
  if ("COMPLETED".equals(session.getStatus()) || "TERMINATED".equals(session.getStatus())) return InterviewSessionResponse.from(session);
  session.setStatus("TERMINATED");
  session.setCompletedAt(LocalDateTime.now());
  List<InterviewQuestionEntity> answeredQuestions = questionRepo.findBySession_IdOrderByQuestionOrderAsc(id);
  double partialAverage = answeredQuestions.stream().filter(q -> "ANSWERED".equals(q.getStatus()) && q.getScore() != null)
      .mapToDouble(InterviewQuestionEntity::getScore).average().orElse(0.0);
  session.setScore(Math.round(partialAverage * 100.0) / 100.0);
  session.setTerminationReason(reason == null ? "Integrity policy violation" : reason);
  session.setFeedback("Interview submitted automatically due to integrity restrictions. " +
      "Partial evaluation is based on " + answeredQuestions.stream().filter(q -> "ANSWERED".equals(q.getStatus())).count() +
      " answered questions. Reason: " + session.getTerminationReason());
  return InterviewSessionResponse.from(sessionRepo.save(session));
 }

 @Transactional(readOnly=true)
 public List<InterviewSessionResponse> getMyInterviews(String email) { return sessionRepo.findByUserEmailOrderByCreatedAtDesc(email).stream().map(InterviewSessionResponse::from).toList(); }
 private InterviewSessionEntity requireSession(Long id,String email) { return sessionRepo.findByIdAndUserEmail(id,email).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Interview session not found")); }
 private List<String> parseQuestions(String raw) { return raw.lines().map(String::trim).filter(s->!s.isBlank()).map(s->s.replaceFirst("^\\s*(?:Q(?:uestion)?\\s*)?\\d+\\s*[.)-:]\\s*", "").trim()).filter(s->!s.isBlank()).toList(); }
 private double extractScore(String evaluation) { Matcher m=Pattern.compile("(?i)score\\s*:?\\s*(\\d+(?:\\.\\d+)?)").matcher(evaluation); if(!m.find()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"AI evaluation did not include a valid score"); double score=Double.parseDouble(m.group(1)); if(score<0||score>10) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"AI returned a score outside the 0–10 range"); return score; }
}
