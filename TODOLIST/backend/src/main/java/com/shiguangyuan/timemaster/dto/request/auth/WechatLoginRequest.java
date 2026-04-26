package com.shiguangyuan.timemaster.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatLoginRequest {
    @NotBlank(message = "微信登录code不能为空")
    private String code;
    private UserInfo userInfo;

    @Data
    public static class UserInfo {
        private String nickName;
        private String avatarUrl;
        private Integer gender;
    }
}
