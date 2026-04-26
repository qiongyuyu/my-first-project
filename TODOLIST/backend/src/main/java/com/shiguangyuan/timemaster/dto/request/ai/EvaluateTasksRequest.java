package com.shiguangyuan.timemaster.dto.request.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluateTasksRequest {
    private List<TaskInfo> tasks;
    private Weights weights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskInfo {
        private String taskId;
        private String title;
        private String description;
        private String deadline;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Weights {
        private double urgency;
        private double importance;
    }
}
