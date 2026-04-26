package com.shiguangyuan.timemaster.controller.user;

import com.shiguangyuan.timemaster.dto.request.user.UpdateProfileRequest;
import com.shiguangyuan.timemaster.dto.request.user.UpdateSettingsRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<?> getProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ApiResponse<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(userService.updateProfile(userId, request));
    }

    @PutMapping("/settings")
    public ApiResponse<?> updateSettings(@RequestBody UpdateSettingsRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.updateSettings(userId, request);
        return ApiResponse.success(null);
    }
}
