package com.shiguangyuan.timemaster.dto.response.social;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private String teamId;
    private String creatorId;
    private String name;
    private String description;
    private String goal;
    private Integer memberCount;
    private Boolean isPublic;
    private String createdAt;
}
