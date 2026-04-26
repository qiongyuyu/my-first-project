package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.social.CreateTeamRequest;
import com.shiguangyuan.timemaster.dto.response.social.TeamResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.Team;
import com.shiguangyuan.timemaster.model.entity.TeamMember;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.enums.TeamRole;
import com.shiguangyuan.timemaster.repository.PomodoroRepository;
import com.shiguangyuan.timemaster.repository.TeamMemberRepository;
import com.shiguangyuan.timemaster.repository.TeamRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.service.TeamService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final IdGenerator idGenerator;
    private final PomodoroRepository pomodoroRepository;

    @Override
    public List<TeamResponse> getTeams(String userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserUserId(userId);
        Set<String> teamIds = memberships.stream()
                .map(m -> m.getTeam().getTeamId())
                .collect(Collectors.toSet());

        List<Team> publicTeams = teamRepository.findByIsPublicTrue();
        for (Team t : publicTeams) {
            teamIds.add(t.getTeamId());
        }

        return teamIds.stream()
                .map(id -> teamRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamResponse createTeam(String userId, CreateTeamRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        Team team = Team.builder()
                .teamId(idGenerator.generateId())
                .creator(user)
                .name(request.getName())
                .description(request.getDescription())
                .goal(request.getGoal())
                .memberCount(1)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .build();
        team = teamRepository.save(team);

        TeamMember member = TeamMember.builder()
                .teamMemberId(idGenerator.generateId())
                .team(team)
                .user(user)
                .role(TeamRole.OWNER)
                .build();
        teamMemberRepository.save(member);

        return mapToResponse(team);
    }

    @Override
    public TeamResponse getTeamDetail(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("团队", teamId));
        return mapToResponse(team);
    }

    @Override
    public List<Map<String, Object>> getTeamRanking(String teamId, String period) {
        List<TeamMember> members = teamMemberRepository.findByTeamTeamId(teamId);

        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();
        switch (period != null ? period : "week") {
            case "month":
                start = end.minusDays(30);
                break;
            default:
                start = end.minusDays(7);
        }

        List<Map<String, Object>> ranking = new ArrayList<>();
        for (TeamMember member : members) {
            long totalDuration = pomodoroRepository.sumFocusDurationByUserIdAndPeriod(
                    member.getUser().getUserId(), start, end);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("userId", member.getUser().getUserId());
            entry.put("nickName", member.getUser().getNickName());
            entry.put("avatarUrl", member.getUser().getAvatarUrl());
            entry.put("totalDuration", totalDuration);
            entry.put("totalHours", Math.round(totalDuration / 3600.0 * 10) / 10.0);
            ranking.add(entry);
        }

        ranking.sort((a, b) -> Long.compare(
                (Long) b.get("totalDuration"),
                (Long) a.get("totalDuration")));

        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).put("rank", i + 1);
        }

        return ranking;
    }

    private TeamResponse mapToResponse(Team team) {
        TeamResponse response = new TeamResponse();
        response.setTeamId(team.getTeamId());
        response.setCreatorId(team.getCreator().getUserId());
        response.setName(team.getName());
        response.setDescription(team.getDescription());
        response.setGoal(team.getGoal());
        response.setMemberCount(team.getMemberCount());
        response.setIsPublic(team.getIsPublic());
        response.setCreatedAt(team.getCreatedAt() != null ? team.getCreatedAt().toString() : null);
        return response;
    }
}
