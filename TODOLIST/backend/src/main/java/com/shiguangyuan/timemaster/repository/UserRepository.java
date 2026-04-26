package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByOpenId(String openId);
    Optional<User> findByUnionId(String unionId);
}
