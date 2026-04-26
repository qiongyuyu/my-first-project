package com.shiguangyuan.timemaster.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @Column(name = "user_id", length = 32)
    private String userId;

    @Column(name = "open_id", length = 64, nullable = false, unique = true)
    private String openId;

    @Column(name = "union_id", length = 64, unique = true)
    private String unionId;

    @Column(name = "nick_name", length = 64, nullable = false)
    private String nickName;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer gender = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer experience = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String theme = "light";

    @Column(name = "font_size", nullable = false)
    @Builder.Default
    private Integer fontSize = 16;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> notifications;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Pomodoro> pomodoros = new ArrayList<>();
}
