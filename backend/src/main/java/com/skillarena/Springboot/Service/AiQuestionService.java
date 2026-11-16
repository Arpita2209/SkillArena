
package com.skillarena.Springboot.Service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.JsonNode;

import com.skillarena.Springboot.Entity.InterviewConfigEntity;

@Service
public class AiQuestionService {

    private final RestClient restClient;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    @Value("${groq.model:openai/gpt-oss-20b}")
    private String groqModel;

    public AiQuestionService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public String generateFollowUp(String originalQuestion, String answer, int followUpDepth, int maxFollowUps) {
        String prompt = """
                You are a skilled, adaptive interviewer conducting a live interview.
                Review the candidate's answer to the question below and decide whether one concise follow-up
                would meaningfully probe an unclear, incomplete, interesting, or technically shallow part.
                Do not repeat the original question. Do not ask a follow-up merely for the sake of asking.
                If the answer is already sufficiently complete, return exactly: NO_FOLLOW_UP
                Otherwise return exactly one question prefixed with: FOLLOW_UP:
                Keep the question relevant to the candidate's actual answer. Do not provide evaluation,
                scores, hints, model answers, or explanations.
                Original question: %s
                Candidate answer: %s
                Follow-up depth already used: %d
                Maximum follow-ups allowed: %d
                """.formatted(originalQuestion, answer, followUpDepth, maxFollowUps);

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", new Object[] {
                        Map.of("role", "system", "content", "Return only NO_FOLLOW_UP or one FOLLOW_UP question."),
                        Map.of("role", "user", "content", prompt)
                },
                "temperature", 0.45
        );
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq API key is not configured.");
        }
        try {
            JsonNode response = restClient.post().uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .body(requestBody).retrieve().body(JsonNode.class);
            if (response == null || response.path("choices").isEmpty()) return "NO_FOLLOW_UP";
            String content = response.path("choices").get(0).path("message").path("content").asText("").trim();
            if (content.equalsIgnoreCase("NO_FOLLOW_UP")) return "NO_FOLLOW_UP";
            content = content.replaceFirst("(?i)^FOLLOW_UP\\s*:\\s*", "").trim();
            return content.isBlank() ? "NO_FOLLOW_UP" : content;
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI follow-up generation failed: " + e.getStatusCode());
        }
    }

    public String generateQuestions(InterviewConfigEntity config) {

        String prompt = """
                You are an expert technical interviewer.

                Generate %d interview questions.

                Interview type: %s
                Programming language: %s
                Difficulty: %s

                Return only a numbered list of questions.
                Do not include answers or explanations.
                """.formatted(
                config.getNumberOfQuestions(),
                config.getInterviewType(),
                config.getProgrammingLanguage(),
                config.getDifficulty()
        );

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", new Object[] {
                        Map.of(
                                "role", "system",
                                "content", "You are a professional interview question generator."
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                },
                "temperature", 0.7
        );

        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq API key is not configured. Set GROQ_API_KEY in the backend environment.");
        }

        try {
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null
                    || response.path("choices").isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Empty response from AI service"
                );
            }

            return response.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI question generation failed: " + e.getStatusCode()
            );
        }
    }
}
