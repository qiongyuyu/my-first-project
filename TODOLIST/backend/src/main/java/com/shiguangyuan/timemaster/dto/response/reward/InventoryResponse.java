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
public class InventoryResponse {
    private List<InventoryItem> items;
    private Integer total;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItem {
        private String itemId;
        private String name;
        private String iconUrl;
        private String rarity;
        private Integer count;
        private String description;
    }
}
