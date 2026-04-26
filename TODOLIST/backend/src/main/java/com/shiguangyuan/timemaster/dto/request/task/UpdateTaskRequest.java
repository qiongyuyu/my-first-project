package com.shiguangyuan.timemaster.dto.request.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private String title;
    private String description;
    private String deadline;
    private String priority;
    private String status;
    private String quadrant;
    private Integer completedPomos;
    private Integer estimatedPomos;
    private Integer progress;
}
