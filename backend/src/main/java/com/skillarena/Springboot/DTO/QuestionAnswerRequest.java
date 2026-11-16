package com.skillarena.Springboot.DTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record QuestionAnswerRequest(@NotNull Long questionId, @NotBlank @Size(max=12000) String answer) {}
