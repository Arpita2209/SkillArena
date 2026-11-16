package com.skillarena.Springboot.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.skillarena.Springboot.Entity.InterviewQuestionEntity;

public interface InterviewQuestionRepo extends JpaRepository<InterviewQuestionEntity, Long> {
    List<InterviewQuestionEntity> findBySession_IdOrderByQuestionOrderAsc(Long sessionId);
    Optional<InterviewQuestionEntity> findByIdAndSession_Id(Long id, Long sessionId);
    long countBySession_IdAndStatus(Long sessionId, String status);
    long countByParentQuestionId(Long parentQuestionId);
}
