package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.reward.CreateCustomRewardRequest;
import com.shiguangyuan.timemaster.dto.request.reward.GachaDrawRequest;
import com.shiguangyuan.timemaster.dto.request.reward.UseItemRequest;
import com.shiguangyuan.timemaster.dto.response.reward.GachaResultResponse;
import com.shiguangyuan.timemaster.dto.response.reward.InventoryResponse;
import com.shiguangyuan.timemaster.dto.response.reward.UserStatsResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.*;
import com.shiguangyuan.timemaster.model.enums.ItemRarity;
import com.shiguangyuan.timemaster.repository.*;
import com.shiguangyuan.timemaster.service.RewardService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardServiceImpl implements RewardService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final InventoryRepository inventoryRepository;
    private final CustomRewardRepository customRewardRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final IdGenerator idGenerator;

    private final Random random = new Random();

    @Override
    public UserStatsResponse getUserStats(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        int nextLevelExp = user.getLevel() * 100;
        int levelProgress = nextLevelExp > 0 ? (int) ((double) user.getExperience() / nextLevelExp * 100) : 100;
        long totalRewards = inventoryRepository.countByUserUserId(userId);

        List<UserBadge> userBadges = userBadgeRepository.findByUserUserId(userId);
        List<UserStatsResponse.BadgeInfo> badgeInfos = userBadges.stream().map(ub -> {
            UserStatsResponse.BadgeInfo info = new UserStatsResponse.BadgeInfo();
            info.setBadgeId(ub.getBadge().getBadgeId());
            info.setName(ub.getBadge().getName());
            info.setDescription(ub.getBadge().getDescription());
            info.setIconUrl(ub.getBadge().getIconUrl());
            info.setUnlocked(ub.getIsUnlocked());
            info.setUnlockedAt(ub.getUnlockedAt() != null ? ub.getUnlockedAt().toString() : null);
            return info;
        }).collect(Collectors.toList());

        UserStatsResponse response = new UserStatsResponse();
        response.setPoints(user.getPoints());
        response.setExperience(user.getExperience());
        response.setLevel(user.getLevel());
        response.setNextLevelExp(nextLevelExp);
        response.setLevelProgress((double) Math.min(levelProgress, 100));
        response.setTotalRewards((int) totalRewards);
        response.setBadges(badgeInfos);
        return response;
    }

    @Override
    @Transactional
    public GachaResultResponse drawGacha(String userId, GachaDrawRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        boolean isMulti = "multi".equals(request.getType());
        int cost = isMulti ? 900 : 100;

        if (user.getPoints() < cost) {
            throw new BusinessException(400, "积分不足");
        }

        user.setPoints(user.getPoints() - cost);
        userRepository.save(user);

        Map<String, Double> probabilities = new LinkedHashMap<>();
        probabilities.put("common", 50.0);
        probabilities.put("rare", 30.0);
        probabilities.put("epic", 15.0);
        probabilities.put("legendary", 5.0);

        ItemRarity rarity = rollRarity(probabilities);
        if (isMulti) {
            ItemRarity minRarity = ItemRarity.RARE;
            if (rarity.ordinal() < minRarity.ordinal()) {
                rarity = minRarity;
            }
        }

        List<Item> items = itemRepository.findByRarityAndIsActiveTrue(rarity);
        if (items.isEmpty()) {
            items = itemRepository.findByIsActiveTrue();
        }
        if (items.isEmpty()) {
            throw new BusinessException(500, "没有可用的道具");
        }

        Item item = items.get(random.nextInt(items.size()));
        UserInventory inventory = inventoryRepository.findByUserUserIdAndItemItemId(userId, item.getItemId())
                .orElse(null);
        if (inventory != null) {
            inventory.setCount(inventory.getCount() + 1);
            inventoryRepository.save(inventory);
        } else {
            inventory = UserInventory.builder()
                    .inventoryId(idGenerator.generateId())
                    .user(user)
                    .item(item)
                    .count(1)
                    .build();
            inventoryRepository.save(inventory);
        }

        GachaResultResponse response = new GachaResultResponse();
        response.setSuccess(true);
        response.setCost(cost);
        response.setRemainingPoints(user.getPoints());

        GachaResultResponse.ItemInfo itemInfo = new GachaResultResponse.ItemInfo();
        itemInfo.setItemId(item.getItemId());
        itemInfo.setName(item.getName());
        itemInfo.setIconUrl(item.getIconUrl());
        itemInfo.setRarity(item.getRarity().name().toLowerCase());
        itemInfo.setDescription(item.getDescription());
        response.setItem(itemInfo);

        return response;
    }

    @Override
    public InventoryResponse getInventory(String userId) {
        List<UserInventory> inventories = inventoryRepository.findByUserUserId(userId);
        List<InventoryResponse.InventoryItem> items = inventories.stream().map(inv -> {
            InventoryResponse.InventoryItem item = new InventoryResponse.InventoryItem();
            item.setItemId(inv.getItem().getItemId());
            item.setName(inv.getItem().getName());
            item.setIconUrl(inv.getItem().getIconUrl());
            item.setRarity(inv.getItem().getRarity().name().toLowerCase());
            item.setCount(inv.getCount());
            item.setDescription(inv.getItem().getDescription());
            return item;
        }).collect(Collectors.toList());

        InventoryResponse response = new InventoryResponse();
        response.setItems(items);
        response.setTotal(items.size());
        return response;
    }

    @Override
    @Transactional
    public void useItem(String userId, String itemId, UseItemRequest request) {
        UserInventory inventory = inventoryRepository.findByUserUserIdAndItemItemId(userId, itemId)
                .orElseThrow(() -> new ResourceNotFoundException("道具", itemId));

        int useCount = request.getCount() != null ? request.getCount() : 1;
        if (inventory.getCount() < useCount) {
            throw new BusinessException(400, "道具数量不足");
        }

        inventory.setCount(inventory.getCount() - useCount);
        if (inventory.getCount() <= 0) {
            inventoryRepository.delete(inventory);
        } else {
            inventoryRepository.save(inventory);
        }
    }

    @Override
    public List<CustomReward> getCustomRewards(String userId) {
        return customRewardRepository.findByUserUserId(userId);
    }

    @Override
    @Transactional
    public CustomReward createCustomReward(String userId, CreateCustomRewardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        CustomReward reward = CustomReward.builder()
                .rewardId(idGenerator.generateId())
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .conditionType(request.getConditionType())
                .conditionValue(request.getConditionValue())
                .isCompleted(false)
                .build();

        return customRewardRepository.save(reward);
    }

    @Override
    @Transactional
    public CustomReward updateCustomReward(String userId, String rewardId, CreateCustomRewardRequest request) {
        CustomReward reward = customRewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("自定义奖励", rewardId));

        if (!reward.getUser().getUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作此奖励");
        }

        if (request.getTitle() != null) reward.setTitle(request.getTitle());
        if (request.getDescription() != null) reward.setDescription(request.getDescription());
        if (request.getConditionType() != null) reward.setConditionType(request.getConditionType());
        if (request.getConditionValue() != null) reward.setConditionValue(request.getConditionValue());

        return customRewardRepository.save(reward);
    }

    @Override
    @Transactional
    public void deleteCustomReward(String userId, String rewardId) {
        CustomReward reward = customRewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("自定义奖励", rewardId));

        if (!reward.getUser().getUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作此奖励");
        }

        customRewardRepository.delete(reward);
    }

    private ItemRarity rollRarity(Map<String, Double> probabilities) {
        double total = probabilities.values().stream().mapToDouble(Double::doubleValue).sum();
        double roll = random.nextDouble() * total;
        double cumulative = 0;
        for (Map.Entry<String, Double> entry : probabilities.entrySet()) {
            cumulative += entry.getValue();
            if (roll <= cumulative) {
                return ItemRarity.valueOf(entry.getKey().toUpperCase());
            }
        }
        return ItemRarity.COMMON;
    }
}
