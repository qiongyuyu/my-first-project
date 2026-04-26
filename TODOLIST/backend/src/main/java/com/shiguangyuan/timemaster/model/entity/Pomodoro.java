package com.shiguangyuan.timemaster.model.entity;

import com.shiguangyuan.timemaster.model.enums.PomodoroType;
import com.shiguangyuan.timemaster.model.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "pomodoros")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Pomodoro {

    @Id
    @Column(name = "pomodoro_id", length = 32)
    private String pomodoroId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @ToString.Exclude
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private PomodoroType type = PomodoroType.FOCUS;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private Integer duration = 0;

    @Column(name = "is_interrupted", nullable = false)
    @Builder.Default
    private Boolean isInterrupted = false;

    @Column(name = "interrupt_reason", length = 50)
    private String interruptReason;

    @Column(name = "expected_duration", nullable = false)
    @Builder.Default
    private Integer expectedDuration = 1500;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_status", length = 20, nullable = false)
    @Builder.Default
    private SyncStatus syncStatus = SyncStatus.SYNCED;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "device_info", columnDefinition = "JSON")
    private Map<String, Object> deviceInfo;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
