package com.shiguangyuan.timemaster.dto.request.social;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamRequest {
    @NotBlank(message = "团队名称不能为空")
    private String name;
    private String description;
    private String goal;
    private Boolean isPublic;
}
