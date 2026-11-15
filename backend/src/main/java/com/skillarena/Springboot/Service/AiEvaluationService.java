
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

@Service
public class AiEvaluationService {

    private final RestClient restClient;

    @Value("${GROQ_API_KEY}")
    private String groqApiKey;

    public AiEvaluationService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public String evaluateAnswer(String question, String answer) {

        String prompt = """
                You are an expert technical interviewer.

                Evaluate the candidate's answer.

                Question: %s

                Candidate Answer: %s

                Evaluate based on:
                1. Technical correctness
                2. Understanding of the concept
                3. Completeness
                4. Clarity

                Return the result in this format:

                Score: (0 to 10)
                Feedback: (Detailed feedback)
                Improvements: (What the candidate should improve)
                """.formatted(question, answer);

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "messages", new Object[] {
                        Map.of(
                                "role", "system",
                                "content", "You are a professional interview evaluator."
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                },
                "temperature", 0.3
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
                        "Empty response from AI evaluation service"
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
                    "AI evaluation failed: " + e.getStatusCode()
            );
        }
    }
}
