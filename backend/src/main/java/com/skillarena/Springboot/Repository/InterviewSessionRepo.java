
package com.skillarena.Springboot.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillarena.Springboot.Entity.InterviewSessionEntity;

@Repository
public interface InterviewSessionRepo
        extends JpaRepository<InterviewSessionEntity, Long> {

    List<InterviewSessionEntity> findByUserEmail(String userEmail);

    InterviewSessionEntity findByIdAndUserEmail(
            Long id, String userEmail);
}
