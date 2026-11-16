package com.skillarena.Springboot.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IntegrityEventRequest(
    @NotBlank @Size(max = 80) String eventType,
    @NotBlank @Size(max = 20) String severity,
    @Size(max = 1200) String details
) {}
