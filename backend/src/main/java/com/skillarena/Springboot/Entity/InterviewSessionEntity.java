package com.skillarena.Springboot.Entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Getter @Setter
@Table(name = "interview_sessions")
public class InterviewSessionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String userEmail;
    private Long configId;
    @Column(columnDefinition = "LONGTEXT") private String questions;
    @Column(columnDefinition = "LONGTEXT") private String answers;
    private Double score;
    @Column(columnDefinition = "LONGTEXT") private String feedback;
    private LocalDateTime createdAt;
    @Column(length = 30, nullable = false) private String status = "IN_PROGRESS";
    private Integer currentQuestionIndex = 0;
    private Integer totalQuestions = 0;
    private LocalDateTime completedAt;
    @Column(length = 500) private String terminationReason;
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    private List<InterviewQuestionEntity> questionItems = new ArrayList<>();
    @PrePersist public void onCreate() { createdAt = LocalDateTime.now(); if(status == null) status="IN_PROGRESS"; if(currentQuestionIndex == null) currentQuestionIndex=0; }
}
