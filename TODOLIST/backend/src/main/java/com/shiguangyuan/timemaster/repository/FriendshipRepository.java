package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Friendship;
import com.shiguangyuan.timemaster.model.enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, String> {
    Optional<Friendship> findByUserUserIdAndFriendUserId(String userId, String friendId);
    List<Friendship> findByUserUserId(String userId);
    List<Friendship> findByFriendUserIdAndStatus(String friendId, FriendshipStatus status);
    List<Friendship> findByUserUserIdAndStatus(String userId, FriendshipStatus status);
    boolean existsByUserUserIdAndFriendUserId(String userId, String friendId);
}
