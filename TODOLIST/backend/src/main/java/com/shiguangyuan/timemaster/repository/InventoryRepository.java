package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.UserInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<UserInventory, String> {
    List<UserInventory> findByUserUserId(String userId);
    Optional<UserInventory> findByUserUserIdAndItemItemId(String userId, String itemId);
    long countByUserUserId(String userId);
}
