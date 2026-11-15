
package com.skillarena.Springboot.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skillarena.Springboot.DTO.InterviewConfigRequest;
import com.skillarena.Springboot.Entity.InterviewConfigEntity;
import com.skillarena.Springboot.Repository.InterviewConfigRepo;

@Service
public class InterviewConfigService {

	@Autowired
    private final InterviewConfigRepo interviewConfigRepo;

    public InterviewConfigService(InterviewConfigRepo interviewConfigRepo) {
        this.interviewConfigRepo = interviewConfigRepo;
    }

    public InterviewConfigEntity createConfig(
            InterviewConfigRequest request, String userEmail) {

        if (!List.of("Technical", "HR", "Mixed")
                .contains(request.getInterviewType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid interview type");
        }

        if (!List.of("Beginner", "Intermediate", "Advanced")
                .contains(request.getDifficulty())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid difficulty");
        }

        InterviewConfigEntity config = new InterviewConfigEntity();

        config.setUserEmail(userEmail);
        config.setInterviewType(request.getInterviewType());
        config.setProgrammingLanguage(request.getProgrammingLanguage());
        config.setDifficulty(request.getDifficulty());
        config.setNumberOfQuestions(request.getNumberOfQuestions());

        return interviewConfigRepo.save(config);
    }

    public List<InterviewConfigEntity> getMyConfigs(String userEmail) {
        return interviewConfigRepo.findByUserEmail(userEmail);
    }
}
