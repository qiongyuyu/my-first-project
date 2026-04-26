package com.shiguangyuan.timemaster.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiStatusResponse {
    private boolean available;
    private long responseTime;
    private String model;
    private RateLimit rateLimit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RateLimit {
        private int remaining;
        private int limit;
        private String resetAt;
    }
}
