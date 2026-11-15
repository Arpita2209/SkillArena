
package com.skillarena.Springboot.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnswerRequest {

    @NotBlank(message = "Answer cannot be empty")
    private String answer;

}
