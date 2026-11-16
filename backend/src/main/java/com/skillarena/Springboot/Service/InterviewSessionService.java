
package com.skillarena.Springboot.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.skillarena.Springboot.Entity.InterviewConfigEntity;
import com.skillarena.Springboot.Entity.InterviewSessionEntity;
import com.skillarena.Springboot.Repository.InterviewConfigRepo;
import com.skillarena.Springboot.Repository.InterviewSessionRepo;

@Service
public class InterviewSessionService {

    private final InterviewConfigRepo configRepo;
    private final InterviewSessionRepo sessionRepo;
    private final AiQuestionService aiQuestionService;
    private final AiEvaluationService aiEvaluationService;

    public InterviewSessionService(
            InterviewConfigRepo configRepo,
            InterviewSessionRepo sessionRepo,
            AiQuestionService aiQuestionService,
            AiEvaluationService aiEvaluationService) {

        this.configRepo = configRepo;
        this.sessionRepo = sessionRepo;
        this.aiQuestionService = aiQuestionService;
        this.aiEvaluationService = aiEvaluationService;
    }

    public InterviewSessionEntity startInterview(
            Long configId, String userEmail) {

        InterviewConfigEntity config = configRepo
                .findById(configId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Interview configuration not found"));

        if (!config.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Unauthorized access to configuration");
        }

        String questions = aiQuestionService.generateQuestions(config);

        InterviewSessionEntity session = new InterviewSessionEntity();

        session.setUserEmail(userEmail);
        session.setConfigId(configId);
        session.setQuestions(questions);
        session.setAnswers("");
        session.setScore(0.0);
        session.setFeedback("Interview started. Evaluation pending.");

        return sessionRepo.save(session);
    }

    @Transactional
    public InterviewSessionEntity submitAnswer(
            Long sessionId, String answer, String userEmail) {

        InterviewSessionEntity session = sessionRepo
                .findByIdAndUserEmail(sessionId, userEmail);

        if (session == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Interview session not found");
        }

        String question = session.getQuestions();

        String evaluation = aiEvaluationService.evaluateAnswer(
                question, answer);

        session.setAnswers(answer);
        session.setFeedback(evaluation);
        session.setScore(extractScore(evaluation));

        return sessionRepo.save(session);
    }

    private Double extractScore(String evaluation) {

        try {
            String[] parts = evaluation.split("Score:");
            String scoreText = parts[1].trim().split("[\\s/\\n]")[0];
            return Double.parseDouble(scoreText);
        } catch (Exception e) {
            return 0.0;
        }
    }

    public List<InterviewSessionEntity> getMyInterviews(String userEmail) {
        return sessionRepo.findByUserEmail(userEmail);
    }
}
