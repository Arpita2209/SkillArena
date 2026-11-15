
package com.skillarena.Springboot.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillarena.Springboot.Entity.InterviewConfigEntity;

@Repository
public interface InterviewConfigRepo
        extends JpaRepository<InterviewConfigEntity, Long> {

    List<InterviewConfigEntity> findByUserEmail(String userEmail);

}

