package com.shiguangyuan.timemaster.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeStatsResponse {
    private int unlockedCount;
    private int totalCount;
    private List<BadgeProgress> badges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeProgress {
        private String badgeId;
        private String name;
        private String description;
        private String iconUrl;
        private Boolean unlocked;
        private Double progress;
        private String requirement;
    }
}
