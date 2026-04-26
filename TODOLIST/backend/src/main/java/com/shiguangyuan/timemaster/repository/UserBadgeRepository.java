package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, String> {
    Optional<UserBadge> findByUserUserIdAndBadgeBadgeId(String userId, String badgeId);
    List<UserBadge> findByUserUserId(String userId);
    long countByUserUserIdAndIsUnlockedTrue(String userId);
}
