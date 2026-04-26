package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.CustomReward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomRewardRepository extends JpaRepository<CustomReward, String> {
    List<CustomReward> findByUserUserId(String userId);
    List<CustomReward> findByUserUserIdAndIsCompleted(String userId, Boolean isCompleted);
}
