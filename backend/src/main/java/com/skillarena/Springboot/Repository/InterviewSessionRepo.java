package com.skillarena.Springboot.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.skillarena.Springboot.Entity.InterviewSessionEntity;
public interface InterviewSessionRepo extends JpaRepository<InterviewSessionEntity,Long> {
 List<InterviewSessionEntity> findByUserEmailOrderByCreatedAtDesc(String userEmail);
 Optional<InterviewSessionEntity> findByIdAndUserEmail(Long id,String userEmail);
}
