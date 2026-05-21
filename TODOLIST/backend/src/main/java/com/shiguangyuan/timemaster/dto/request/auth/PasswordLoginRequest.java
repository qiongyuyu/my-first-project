package com.shiguangyuan.timemaster.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordLoginRequest {
    @NotBlank(message = "微信登录code不能为空")
    private String code;

    private String nickName;

    private String avatarUrl;

    @NotBlank(message = "密码不能为空")
    private String password;
}
