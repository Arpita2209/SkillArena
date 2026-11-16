package com.skillarena.Springboot.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "interview_questions", uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "question_order"}))
@Getter @Setter
public class InterviewQuestionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSessionEntity session;
    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;
    @Column(nullable = false) private Boolean followUp = false;
    private Integer followUpDepth = 0;
    private Long parentQuestionId;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String questionText;
    @Column(columnDefinition = "LONGTEXT")
    private String answer;
    private Double score;
    @Column(columnDefinition = "LONGTEXT")
    private String feedback;
    @Column(length = 30, nullable = false)
    private String status = "PENDING";
    private LocalDateTime answeredAt;
    @PrePersist void onCreate() { if (status == null) status = "PENDING"; }
}
