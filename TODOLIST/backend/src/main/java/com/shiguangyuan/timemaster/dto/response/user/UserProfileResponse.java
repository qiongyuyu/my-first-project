package com.shiguangyuan.timemaster.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String userId;
    private String nickName;
    private String avatarUrl;
    private Integer points;
    private Integer experience;
    private Integer level;
    private String createdAt;
    private Map<String, Object> settings;
}
