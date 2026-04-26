package com.shiguangyuan.timemaster.dto.response.reward;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private Integer points;
    private Integer experience;
    private Integer level;
    private Integer nextLevelExp;
    private Double levelProgress;
    private Integer totalRewards;
    private List<BadgeInfo> badges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeInfo {
        private String badgeId;
        private String name;
        private String description;
        private String iconUrl;
        private Boolean unlocked;
        private String unlockedAt;
    }
}
