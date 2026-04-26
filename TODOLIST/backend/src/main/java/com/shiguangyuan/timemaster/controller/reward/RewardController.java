package com.shiguangyuan.timemaster.controller.reward;

import com.shiguangyuan.timemaster.dto.request.reward.CreateCustomRewardRequest;
import com.shiguangyuan.timemaster.dto.request.reward.GachaDrawRequest;
import com.shiguangyuan.timemaster.dto.request.reward.UseItemRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping("/user-stats")
    public ApiResponse<?> getUserStats() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.getUserStats(userId));
    }

    @PostMapping("/gacha/draw")
    public ApiResponse<?> drawGacha(@RequestBody GachaDrawRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.drawGacha(userId, request));
    }

    @GetMapping("/inventory")
    public ApiResponse<?> getInventory() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.getInventory(userId));
    }

    @PostMapping("/inventory/{itemId}/use")
    public ApiResponse<?> useItem(@PathVariable String itemId,
                                   @RequestBody UseItemRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        rewardService.useItem(userId, itemId, request);
        return ApiResponse.success(null);
    }

    @GetMapping("/custom-rewards")
    public ApiResponse<?> getCustomRewards() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.getCustomRewards(userId));
    }

    @PostMapping("/custom-rewards")
    public ApiResponse<?> createCustomReward(@RequestBody @Valid CreateCustomRewardRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.createCustomReward(userId, request));
    }

    @PutMapping("/custom-rewards/{rewardId}")
    public ApiResponse<?> updateCustomReward(@PathVariable String rewardId,
                                              @RequestBody CreateCustomRewardRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(rewardService.updateCustomReward(userId, rewardId, request));
    }

    @DeleteMapping("/custom-rewards/{rewardId}")
    public ApiResponse<?> deleteCustomReward(@PathVariable String rewardId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        rewardService.deleteCustomReward(userId, rewardId);
        return ApiResponse.success(null);
    }
}
