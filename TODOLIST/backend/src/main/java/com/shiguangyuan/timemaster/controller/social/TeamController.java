package com.shiguangyuan.timemaster.controller.social;

import com.shiguangyuan.timemaster.dto.request.social.CreateTeamRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ApiResponse<?> getTeams() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(teamService.getTeams(userId));
    }

    @PostMapping
    public ApiResponse<?> createTeam(@RequestBody @Valid CreateTeamRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(teamService.createTeam(userId, request));
    }

    @GetMapping("/{teamId}")
    public ApiResponse<?> getTeamDetail(@PathVariable String teamId) {
        return ApiResponse.success(teamService.getTeamDetail(teamId));
    }

    @GetMapping("/{teamId}/ranking")
    public ApiResponse<?> getTeamRanking(
            @PathVariable String teamId,
            @RequestParam(required = false, defaultValue = "week") String period) {
        return ApiResponse.success(teamService.getTeamRanking(teamId, period));
    }
}
