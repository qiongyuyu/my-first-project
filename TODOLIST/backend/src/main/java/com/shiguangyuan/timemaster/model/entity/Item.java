package com.shiguangyuan.timemaster.model.entity;

import com.shiguangyuan.timemaster.model.enums.ItemRarity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Item {

    @Id
    @Column(name = "item_id", length = 32)
    private String itemId;

    @Column(length = 64, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 512)
    private String iconUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private ItemRarity rarity = ItemRarity.COMMON;

    @Column(name = "effect_type", length = 50)
    private String effectType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "effect_value", columnDefinition = "JSON")
    private Map<String, Object> effectValue;

    @Column(nullable = false)
    @Builder.Default
    private Integer price = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
