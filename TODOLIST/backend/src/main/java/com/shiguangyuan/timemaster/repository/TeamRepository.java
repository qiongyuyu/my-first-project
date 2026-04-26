package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByCreatorUserId(String creatorId);
    List<Team> findByIsPublicTrue();
}
