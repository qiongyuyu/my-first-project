package com.shiguangyuan.timemaster.dto.response.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String taskId;
    private String userId;
    private String title;
    private String description;
    private String deadline;
    private String priority;
    private String quadrant;
    private List<String> breakdown;
    private String status;
    private Integer estimatedPomos;
    private Integer completedPomos;
    private Integer progress;
    private String createdAt;
    private String updatedAt;
    private List<String> tags;
}
