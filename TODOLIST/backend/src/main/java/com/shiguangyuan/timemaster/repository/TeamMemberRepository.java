package com.shiguangyuan.timemaster.repository;

import com.shiguangyuan.timemaster.model.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByTeamTeamId(String teamId);
    Optional<TeamMember> findByTeamTeamIdAndUserUserId(String teamId, String userId);
    long countByTeamTeamId(String teamId);
    List<TeamMember> findByUserUserId(String userId);
}
