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
public class BreakdownResponse {
    private String taskId;
    private List<String> breakdown;
}
