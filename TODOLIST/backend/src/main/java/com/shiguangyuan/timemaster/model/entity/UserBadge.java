package com.shiguangyuan.timemaster.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserBadge {

    @Id
    @Column(name = "user_badge_id", length = 32)
    private String userBadgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    @ToString.Exclude
    private Badge badge;

    @Column(nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "is_unlocked", nullable = false)
    @Builder.Default
    private Boolean isUnlocked = false;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
