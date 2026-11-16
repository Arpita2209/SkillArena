package com.skillarena.Springboot.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.skillarena.Springboot.Entity.InterviewIntegrityEventEntity;

public interface InterviewIntegrityEventRepo extends JpaRepository<InterviewIntegrityEventEntity, Long> {
    long countBySessionIdAndUserEmail(Long sessionId, String userEmail);
}
