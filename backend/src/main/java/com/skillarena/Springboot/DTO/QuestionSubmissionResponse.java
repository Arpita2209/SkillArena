package com.skillarena.Springboot.DTO;

public record QuestionSubmissionResponse(
    Long sessionId, Long questionId, String status,
    Integer answeredQuestions, Integer totalQuestions,
    boolean interviewCompleted, boolean followUpAdded
) {}
