
package com.skillarena.Springboot.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;

import com.skillarena.Springboot.DTO.InterviewConfigRequest;
import com.skillarena.Springboot.Entity.InterviewConfigEntity;
import com.skillarena.Springboot.Service.InterviewConfigService;

@RestController
@RequestMapping("/api/interviews")
@Validated
public class InterviewConfigController {

    private final InterviewConfigService interviewConfigService;

    public InterviewConfigController(
            InterviewConfigService interviewConfigService) {
        this.interviewConfigService = interviewConfigService;
    }

    @PostMapping("/config")
    public InterviewConfigEntity createConfig(
            @Valid @RequestBody InterviewConfigRequest request) {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return interviewConfigService.createConfig(request, userEmail);
    }

    @GetMapping("/config")
    public List<InterviewConfigEntity> getMyConfigs() {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return interviewConfigService.getMyConfigs(userEmail);
    }
}
