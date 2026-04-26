package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.reward.CreateCustomRewardRequest;
import com.shiguangyuan.timemaster.dto.request.reward.GachaDrawRequest;
import com.shiguangyuan.timemaster.dto.request.reward.UseItemRequest;
import com.shiguangyuan.timemaster.dto.response.reward.GachaResultResponse;
import com.shiguangyuan.timemaster.dto.response.reward.InventoryResponse;
import com.shiguangyuan.timemaster.dto.response.reward.UserStatsResponse;
import com.shiguangyuan.timemaster.dto.response.task.TaskResponse;
import com.shiguangyuan.timemaster.model.entity.CustomReward;

import java.util.List;

public interface RewardService {
    UserStatsResponse getUserStats(String userId);
    GachaResultResponse drawGacha(String userId, GachaDrawRequest request);
    InventoryResponse getInventory(String userId);
    void useItem(String userId, String itemId, UseItemRequest request);
    List<CustomReward> getCustomRewards(String userId);
    CustomReward createCustomReward(String userId, CreateCustomRewardRequest request);
    CustomReward updateCustomReward(String userId, String rewardId, CreateCustomRewardRequest request);
    void deleteCustomReward(String userId, String rewardId);
}
