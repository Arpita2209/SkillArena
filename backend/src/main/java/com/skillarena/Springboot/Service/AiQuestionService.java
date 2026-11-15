
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

    @Value("${GROQ_API_KEY}")
    private String groqApiKey;

    public AiQuestionService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
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
                "model", "openai/gpt-oss-20b",
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
