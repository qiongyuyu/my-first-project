package com.shiguangyuan.timemaster.dto.response.reward;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GachaResultResponse {
    private Boolean success;
    private Integer cost;
    private ItemInfo item;
    private Integer remainingPoints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemInfo {
        private String itemId;
        private String name;
        private String iconUrl;
        private String rarity;
        private String description;
    }
}
