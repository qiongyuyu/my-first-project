package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.response.statistics.BadgeStatsResponse;
import com.shiguangyuan.timemaster.dto.response.statistics.FocusTimeResponse;
import com.shiguangyuan.timemaster.dto.response.statistics.TaskCategoryResponse;

public interface StatisticsService {
    FocusTimeResponse getFocusTimeStats(String userId, String period, String startDate, String endDate);
    TaskCategoryResponse getTaskCategories(String userId);
    BadgeStatsResponse getBadgeStats(String userId);
}
