package com.shiguangyuan.timemaster.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordRegisterRequest {
    @NotBlank(message = "微信登录code不能为空")
    private String code;

    @NotBlank(message = "昵称不能为空")
    private String nickName;

    private String avatarUrl;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度为6-20个字符")
    private String password;
}
