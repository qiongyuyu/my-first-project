package com.shiguangyuan.timemaster.controller.auth;

import com.shiguangyuan.timemaster.dto.request.auth.WechatLoginRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/wechat-login")
    public ApiResponse<?> wechatLogin(@RequestBody @Valid WechatLoginRequest request) {
        return ApiResponse.success(authService.wechatLogin(request));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<?> refreshToken() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(authService.refreshToken(userId));
    }
}
