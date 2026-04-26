package com.shiguangyuan.timemaster.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String userId;
        private String openId;
        private String nickName;
        private String avatarUrl;
        private Integer points;
        private Integer experience;
        private Integer level;
        private Map<String, Object> settings;
    }
}
