package com.skillarena.Springboot.DTO;
public record QuestionEvaluationResponse(Long sessionId, Long questionId, Double score, String feedback, String status, Integer nextQuestionIndex, boolean interviewCompleted) {}
