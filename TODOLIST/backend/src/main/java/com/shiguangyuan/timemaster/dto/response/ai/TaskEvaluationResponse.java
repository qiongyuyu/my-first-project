package com.shiguangyuan.timemaster.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskEvaluationResponse {
    private List<Evaluation> evaluations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Evaluation {
        private String taskId;
        private double urgencyScore;
        private double importanceScore;
        private String quadrant;
        private Integer recommendedOrder;
    }
}
