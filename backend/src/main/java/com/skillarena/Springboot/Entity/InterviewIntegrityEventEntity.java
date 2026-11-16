package com.skillarena.Springboot.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "interview_integrity_events")
@Getter @Setter
public class InterviewIntegrityEventEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long sessionId;
    @Column(nullable = false) private String userEmail;
    @Column(nullable = false, length = 80) private String eventType;
    @Column(nullable = false, length = 20) private String severity;
    @Column(length = 1200) private String details;
    @Column(nullable = false) private LocalDateTime createdAt;
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
