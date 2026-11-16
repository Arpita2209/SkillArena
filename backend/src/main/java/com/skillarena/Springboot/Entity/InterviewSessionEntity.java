
package com.skillarena.Springboot.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "interview_sessions")
public class InterviewSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    private Long configId;

    @Column(columnDefinition = "LONGTEXT")
    private String questions;

    @Column(columnDefinition = "LONGTEXT")
    private String answers;

    private Double score;

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
