
package com.skillarena.Springboot.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "interview_configs")
public class InterviewConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String interviewType;

    @Column(nullable = false)
    private String programmingLanguage;

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = false)
    private Integer numberOfQuestions;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
