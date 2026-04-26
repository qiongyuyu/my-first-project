package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.response.statistics.BadgeStatsResponse;
import com.shiguangyuan.timemaster.dto.response.statistics.FocusTimeResponse;
import com.shiguangyuan.timemaster.dto.response.statistics.TaskCategoryResponse;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.Badge;
import com.shiguangyuan.timemaster.model.entity.Pomodoro;
import com.shiguangyuan.timemaster.model.entity.Task;
import com.shiguangyuan.timemaster.model.entity.UserBadge;
import com.shiguangyuan.timemaster.model.enums.PomodoroType;
import com.shiguangyuan.timemaster.repository.*;
import com.shiguangyuan.timemaster.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final PomodoroRepository pomodoroRepository;
    private final TaskRepository taskRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    @Override
    public FocusTimeResponse getFocusTimeStats(String userId, String period, String startDate, String endDate) {
        LocalDateTime start;
        LocalDateTime end;

        if (startDate != null && endDate != null) {
            start = LocalDate.parse(startDate).atStartOfDay();
            end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
        } else {
            LocalDate today = LocalDate.now();
            switch (period != null ? period : "week") {
                case "day":
                    start = today.atStartOfDay();
                    end = today.atTime(LocalTime.MAX);
                    break;
                case "month":
                    start = today.withDayOfMonth(1).atStartOfDay();
                    end = today.atTime(LocalTime.MAX);
                    break;
                case "year":
                    start = today.withDayOfYear(1).atStartOfDay();
                    end = today.atTime(LocalTime.MAX);
                    break;
                default:
                    start = today.minusDays(6).atStartOfDay();
                    end = today.atTime(LocalTime.MAX);
            }
        }

        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        Map<LocalDate, long[]> dailyStats = new TreeMap<>();
        long totalDuration = 0;
        int totalPomos = 0;

        for (Pomodoro p : records) {
            if (!p.getIsInterrupted()) {
                LocalDate date = p.getStartTime().toLocalDate();
                dailyStats.computeIfAbsent(date, k -> new long[2]);
                dailyStats.get(date)[0] += p.getDuration();
                dailyStats.get(date)[1] += 1;
                totalDuration += p.getDuration();
                totalPomos++;
            }
        }

        List<FocusTimeResponse.FocusData> data = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        while (!current.isAfter(end.toLocalDate())) {
            long[] stats = dailyStats.getOrDefault(current, new long[2]);
            FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
            fd.setDate(current.toString());
            fd.setDuration(stats[0]);
            fd.setPomoCount((int) stats[1]);
            data.add(fd);
            current = current.plusDays(1);
        }

        long days = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate()));

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod(period);
        response.setData(data);
        response.setTotalDuration(totalDuration);
        response.setTotalPomos(totalPomos);
        response.setAverageDaily(totalDuration / days);
        return response;
    }

    @Override
    public TaskCategoryResponse getTaskCategories(String userId) {
        List<Task> tasks = taskRepository.findByUserUserId(userId, null).getContent();
        Map<String, long[]> categoryStats = new LinkedHashMap<>();

        for (Task task : tasks) {
            String category = task.getPriority() != null ? task.getPriority().name() : "其他";
            categoryStats.computeIfAbsent(category, k -> new long[2]);
            categoryStats.get(category)[0] += 1;
            categoryStats.get(category)[1] += task.getEstimatedPomos() * 1500L;
        }

        long totalDuration = categoryStats.values().stream().mapToLong(v -> v[1]).sum();
        long totalCount = categoryStats.values().stream().mapToLong(v -> v[0]).sum();

        List<TaskCategoryResponse.CategoryData> categories = categoryStats.entrySet().stream().map(entry -> {
            TaskCategoryResponse.CategoryData cd = new TaskCategoryResponse.CategoryData();
            cd.setCategory(entry.getKey());
            cd.setCount((int) entry.getValue()[0]);
            cd.setDuration(entry.getValue()[1]);
            cd.setPercentage(totalDuration > 0
                    ? (double) (entry.getValue()[1] * 100) / totalDuration
                    : 0.0);
            return cd;
        }).collect(Collectors.toList());

        TaskCategoryResponse response = new TaskCategoryResponse();
        response.setCategories(categories);
        return response;
    }

    @Override
    public BadgeStatsResponse getBadgeStats(String userId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserUserId(userId);

        Map<String, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getBadgeId(), ub -> ub));

        long unlockedCount = userBadgeRepository.countByUserUserIdAndIsUnlockedTrue(userId);

        List<BadgeStatsResponse.BadgeProgress> badgeList = allBadges.stream().map(badge -> {
            UserBadge ub = userBadgeMap.get(badge.getBadgeId());
            BadgeStatsResponse.BadgeProgress bp = new BadgeStatsResponse.BadgeProgress();
            bp.setBadgeId(badge.getBadgeId());
            bp.setName(badge.getName());
            bp.setDescription(badge.getDescription());
            bp.setIconUrl(badge.getIconUrl());
            bp.setUnlocked(ub != null && ub.getIsUnlocked());
            bp.setProgress(ub != null ? ub.getProgress().doubleValue() : 0.0);
            bp.setRequirement(badge.getConditionValue() != null
                    ? badge.getConditionValue().toString()
                    : badge.getConditionType());
            return bp;
        }).collect(Collectors.toList());

        BadgeStatsResponse response = new BadgeStatsResponse();
        response.setUnlockedCount((int) unlockedCount);
        response.setTotalCount(allBadges.size());
        response.setBadges(badgeList);
        return response;
    }
}
