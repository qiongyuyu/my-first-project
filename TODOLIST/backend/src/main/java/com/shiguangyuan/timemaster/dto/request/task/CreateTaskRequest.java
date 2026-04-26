package com.shiguangyuan.timemaster.dto.request.task;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    @NotBlank(message = "任务标题不能为空")
    private String title;
    private String description;
    private String deadline;
    private String priority;
    private Integer estimatedPomos;
    private List<String> tags;
}
