package com.skillarena.Springboot.Controller;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.skillarena.Springboot.DTO.*;
import com.skillarena.Springboot.Service.InterviewSessionService;
@RestController @RequestMapping("/api/interviews")
public class InterviewSessionController {
 private final InterviewSessionService service;
 public InterviewSessionController(InterviewSessionService service){this.service=service;}
 private String email(){return SecurityContextHolder.getContext().getAuthentication().getName();}
 @PostMapping("/start/{configId}") public InterviewSessionResponse start(@PathVariable Long configId){return service.startInterview(configId,email());}
 @GetMapping("/session/{sessionId}") public InterviewSessionResponse get(@PathVariable Long sessionId){return service.getSession(sessionId,email());}
 @PostMapping("/session/{sessionId}/answers") public QuestionSubmissionResponse answer(@PathVariable Long sessionId,@Valid @RequestBody QuestionAnswerRequest request){return service.submitQuestion(sessionId,request,email());}
 @PostMapping("/session/{sessionId}/complete") public InterviewSessionResponse complete(@PathVariable Long sessionId){return service.completeInterview(sessionId,email());}
 @PostMapping("/session/{sessionId}/integrity-events") public InterviewSessionResponse integrity(@PathVariable Long sessionId, @Valid @RequestBody IntegrityEventRequest request){return service.recordIntegrityEvent(sessionId,email(),request);}
 @PostMapping("/session/{sessionId}/terminate") public InterviewSessionResponse terminate(@PathVariable Long sessionId, @RequestBody(required=false) java.util.Map<String,String> body){return service.terminateInterview(sessionId,email(),body==null?null:body.get("reason"));}
 @GetMapping("/history") public List<InterviewSessionResponse> history(){return service.getMyInterviews(email());}
}
