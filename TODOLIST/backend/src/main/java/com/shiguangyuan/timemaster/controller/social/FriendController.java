package com.shiguangyuan.timemaster.controller.social;

import com.shiguangyuan.timemaster.dto.request.social.AddFriendRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ApiResponse<?> getFriends() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(friendService.getFriends(userId));
    }

    @PostMapping
    public ApiResponse<?> addFriend(@RequestBody @Valid AddFriendRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(friendService.addFriend(userId, request));
    }

    @GetMapping("/activities")
    public ApiResponse<?> getFriendActivities(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(friendService.getFriendActivities(userId, page, limit));
    }
}
