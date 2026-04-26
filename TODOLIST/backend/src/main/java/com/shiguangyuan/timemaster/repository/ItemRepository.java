package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Item;
import com.shiguangyuan.timemaster.model.enums.ItemRarity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, String> {
    List<Item> findByRarityAndIsActiveTrue(ItemRarity rarity);
    List<Item> findByIsActiveTrue();
}
