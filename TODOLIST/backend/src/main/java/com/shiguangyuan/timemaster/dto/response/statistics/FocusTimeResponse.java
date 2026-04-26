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
public class FocusTimeResponse {
    private String period;
    private List<FocusData> data;
    private long totalDuration;
    private int totalPomos;
    private long averageDaily;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusData {
        private String date;
        private long duration;
        private int pomoCount;
    }
}
