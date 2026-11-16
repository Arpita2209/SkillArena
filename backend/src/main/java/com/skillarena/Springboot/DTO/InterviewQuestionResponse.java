package com.skillarena.Springboot.DTO;

import java.time.LocalDateTime;
import com.skillarena.Springboot.Entity.InterviewQuestionEntity;

public record InterviewQuestionResponse(
    Long id, Integer questionOrder, String questionText, String answer,
    Double score, String feedback, String status, LocalDateTime answeredAt,
    Boolean followUp, Integer followUpDepth, Long parentQuestionId
) {
    public static InterviewQuestionResponse from(InterviewQuestionEntity q, boolean revealEvaluation) {
        return new InterviewQuestionResponse(
            q.getId(), q.getQuestionOrder(), q.getQuestionText(), q.getAnswer(),
            revealEvaluation ? q.getScore() : null,
            revealEvaluation ? q.getFeedback() : null,
            q.getStatus(), q.getAnsweredAt(), q.getFollowUp(), q.getFollowUpDepth(), q.getParentQuestionId()
        );
    }
}
