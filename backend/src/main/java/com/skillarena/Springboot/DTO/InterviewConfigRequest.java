
package com.skillarena.Springboot.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterviewConfigRequest {

    @NotBlank(message = "Interview type is required")
    private String interviewType;

    @NotBlank(message = "Programming language is required")
    private String programmingLanguage;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Number of questions is required")
    @Min(value = 5, message = "Minimum 5 questions required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    private Integer numberOfQuestions;

}
