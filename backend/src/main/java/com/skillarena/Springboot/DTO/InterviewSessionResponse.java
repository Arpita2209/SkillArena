package com.skillarena.Springboot.DTO;

import java.time.LocalDateTime;
import java.util.List;
import com.skillarena.Springboot.Entity.InterviewSessionEntity;

public record InterviewSessionResponse(
    Long id, Long configId, String status, Integer currentQuestionIndex,
    Integer totalQuestions, Double score, String feedback, String terminationReason, LocalDateTime createdAt,
    LocalDateTime completedAt, List<InterviewQuestionResponse> questions
) {
    public static InterviewSessionResponse from(InterviewSessionEntity s) {
        boolean revealEvaluation = "COMPLETED".equals(s.getStatus()) || "TERMINATED".equals(s.getStatus());
        return new InterviewSessionResponse(
            s.getId(), s.getConfigId(), s.getStatus(), s.getCurrentQuestionIndex(),
            s.getTotalQuestions(), revealEvaluation ? s.getScore() : null,
            revealEvaluation ? s.getFeedback() : null, revealEvaluation ? s.getTerminationReason() : null, s.getCreatedAt(), s.getCompletedAt(),
            s.getQuestionItems().stream().map(q -> InterviewQuestionResponse.from(q, revealEvaluation)).toList()
        );
    }
}
