package com.shiguangyuan.timemaster.dto.request.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreakdownTaskRequest {
    private String taskId;
    private String title;
    private String description;
    private String complexity;

    public String getComplexity() {
        return complexity != null ? complexity : "medium";
    }
}
