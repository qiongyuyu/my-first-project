package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.social.CreateTeamRequest;
import com.shiguangyuan.timemaster.dto.response.social.TeamResponse;

import java.util.List;
import java.util.Map;

public interface TeamService {
    List<TeamResponse> getTeams(String userId);
    TeamResponse createTeam(String userId, CreateTeamRequest request);
    TeamResponse getTeamDetail(String teamId);
    List<Map<String, Object>> getTeamRanking(String teamId, String period);
}
