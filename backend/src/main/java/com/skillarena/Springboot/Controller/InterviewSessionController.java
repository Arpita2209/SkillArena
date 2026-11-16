
package com.skillarena.Springboot.Controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.skillarena.Springboot.DTO.AnswerRequest;
import com.skillarena.Springboot.Entity.InterviewSessionEntity;
import com.skillarena.Springboot.Service.InterviewSessionService;

@RestController
@RequestMapping("/api/interviews")
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;

    public InterviewSessionController(
            InterviewSessionService interviewSessionService) {
        this.interviewSessionService = interviewSessionService;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/start/{configId}")
    public InterviewSessionEntity startInterview(
            @PathVariable Long configId) {

        return interviewSessionService.startInterview(
                configId, getCurrentUserEmail());
    }

    @PostMapping("/submit/{sessionId}")
    public InterviewSessionEntity submitAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody AnswerRequest request) {

        return interviewSessionService.submitAnswer(
                sessionId,
                request.getAnswer(),
                getCurrentUserEmail());
    }

    @GetMapping("/history")
    public List<InterviewSessionEntity> getMyInterviews() {

        return interviewSessionService.getMyInterviews(
                getCurrentUserEmail());
    }
}
