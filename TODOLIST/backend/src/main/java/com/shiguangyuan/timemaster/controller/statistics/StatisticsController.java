package com.shiguangyuan.timemaster.controller.statistics;

import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/focus-time")
    public ApiResponse<?> getFocusTime(
            @RequestParam(required = false, defaultValue = "week") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(statisticsService.getFocusTimeStats(userId, period, startDate, endDate));
    }

    @GetMapping("/task-categories")
    public ApiResponse<?> getTaskCategories() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(statisticsService.getTaskCategories(userId));
    }

    @GetMapping("/badges")
    public ApiResponse<?> getBadges() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(statisticsService.getBadgeStats(userId));
    }
}
