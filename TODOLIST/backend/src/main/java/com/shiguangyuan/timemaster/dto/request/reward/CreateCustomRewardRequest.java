package com.shiguangyuan.timemaster.dto.request.reward;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomRewardRequest {
    @NotBlank(message = "奖励标题不能为空")
    private String title;
    private String description;
    @NotBlank(message = "条件类型不能为空")
    private String conditionType;
    private Map<String, Object> conditionValue;
}
