package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, String> {
    List<Badge> findByConditionType(String conditionType);
}
