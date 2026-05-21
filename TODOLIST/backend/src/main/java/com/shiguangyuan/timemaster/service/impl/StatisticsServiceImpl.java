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
        LocalDate today = LocalDate.now();

        if (startDate != null && endDate != null) {
            // 自定义日期范围仍按天聚合
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            return buildDayLevelResponse(userId, start, end, period, true);
        }

        String p = (period != null) ? period : "week";
        switch (p) {
            case "day":
                return buildDayResponse(userId, today);
            case "week":
                return buildWeekResponse(userId, today);
            case "month":
                return buildMonthResponse(userId, today);
            case "year":
                return buildYearResponse(userId, today);
            default:
                return buildWeekResponse(userId, today);
        }
    }

    /** 今日：返回单条记录 */
    private FocusTimeResponse buildDayResponse(String userId, LocalDate today) {
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        long duration = 0;
        int count = 0;
        for (Pomodoro p : records) {
            if (!p.getIsInterrupted()) { duration += p.getDuration(); count++; }
        }

        FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
        fd.setDate(today.toString());
        fd.setLabel("今日");
        fd.setDuration(duration);
        fd.setPomoCount(count);

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod("day");
        response.setData(Collections.singletonList(fd));
        response.setTotalDuration(duration);
        response.setTotalPomos(count);
        response.setAverageDaily(duration);
        return response;
    }

    /** 本周：周一~周日，每天一条 */
    private FocusTimeResponse buildWeekResponse(String userId, LocalDate today) {
        int dayOfWeek = today.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
        LocalDate monday = today.minusDays(dayOfWeek - 1);
        LocalDate sunday = monday.plusDays(6);

        LocalDateTime start = monday.atStartOfDay();
        LocalDateTime end = sunday.atTime(LocalTime.MAX);

        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        Map<LocalDate, long[]> map = aggregateByDate(records);

        String[] weekLabels = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        List<FocusTimeResponse.FocusData> data = new ArrayList<>();
        long totalDuration = 0;
        int totalPomos = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            long[] stats = map.getOrDefault(d, new long[2]);
            FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
            fd.setDate(d.toString());
            fd.setLabel(weekLabels[i]);
            fd.setDuration(stats[0]);
            fd.setPomoCount((int) stats[1]);
            data.add(fd);
            totalDuration += stats[0];
            totalPomos += (int) stats[1];
        }

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod("week");
        response.setData(data);
        response.setTotalDuration(totalDuration);
        response.setTotalPomos(totalPomos);
        response.setAverageDaily(totalDuration / 7);
        return response;
    }

    /** 本月：按周聚合（第1周~第5周） */
    private FocusTimeResponse buildMonthResponse(String userId, LocalDate today) {
        LocalDate firstDay = today.withDayOfMonth(1);
        int daysInMonth = today.lengthOfMonth();
        LocalDate lastDay = today.withDayOfMonth(daysInMonth);

        LocalDateTime start = firstDay.atStartOfDay();
        LocalDateTime end = lastDay.atTime(LocalTime.MAX);

        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        // 按周分组: weekIndex = (dayOfMonth - 1) / 7
        int totalWeeks = (daysInMonth + firstDay.getDayOfWeek().getValue() - 1 + 6) / 7;
        if (totalWeeks < 4) totalWeeks = 4;
        if (totalWeeks > 5) totalWeeks = 5;

        long[] weekDurations = new long[totalWeeks];
        int[] weekCounts = new int[totalWeeks];

        for (Pomodoro p : records) {
            if (!p.getIsInterrupted()) {
                int dom = p.getStartTime().getDayOfMonth();
                int wi = (dom - 1) / 7;
                if (wi >= totalWeeks) wi = totalWeeks - 1;
                weekDurations[wi] += p.getDuration();
                weekCounts[wi]++;
            }
        }

        List<FocusTimeResponse.FocusData> data = new ArrayList<>();
        long totalDuration = 0;
        int totalPomos = 0;
        for (int i = 0; i < totalWeeks; i++) {
            FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
            fd.setDate(firstDay.plusDays(i * 7).toString());
            fd.setLabel("第" + (i + 1) + "周");
            fd.setDuration(weekDurations[i]);
            fd.setPomoCount(weekCounts[i]);
            data.add(fd);
            totalDuration += weekDurations[i];
            totalPomos += weekCounts[i];
        }

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod("month");
        response.setData(data);
        response.setTotalDuration(totalDuration);
        response.setTotalPomos(totalPomos);
        response.setAverageDaily(totalDuration / daysInMonth);
        return response;
    }

    /** 今年：1月~12月 */
    private FocusTimeResponse buildYearResponse(String userId, LocalDate today) {
        LocalDate firstDay = today.withDayOfYear(1);
        LocalDate lastDay = today.withDayOfYear(today.lengthOfYear());

        LocalDateTime start = firstDay.atStartOfDay();
        LocalDateTime end = lastDay.atTime(LocalTime.MAX);

        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        long[] monthDurations = new long[12];
        int[] monthCounts = new int[12];

        for (Pomodoro p : records) {
            if (!p.getIsInterrupted()) {
                int m = p.getStartTime().getMonthValue() - 1;
                monthDurations[m] += p.getDuration();
                monthCounts[m]++;
            }
        }

        String[] monthLabels = {"1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"};
        List<FocusTimeResponse.FocusData> data = new ArrayList<>();
        long totalDuration = 0;
        int totalPomos = 0;

        for (int i = 0; i < 12; i++) {
            FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
            fd.setDate(firstDay.withMonth(i + 1).toString());
            fd.setLabel(monthLabels[i]);
            fd.setDuration(monthDurations[i]);
            fd.setPomoCount(monthCounts[i]);
            data.add(fd);
            totalDuration += monthDurations[i];
            totalPomos += monthCounts[i];
        }

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod("year");
        response.setData(data);
        response.setTotalDuration(totalDuration);
        response.setTotalPomos(totalPomos);
        response.setAverageDaily(totalDuration / today.lengthOfYear());
        return response;
    }

    /** 自定义日期范围：仍按天聚合（兼容旧逻辑） */
    private FocusTimeResponse buildDayLevelResponse(String userId, LocalDateTime start, LocalDateTime end,
                                                     String period, boolean fillGaps) {
        List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetweenAndType(
                userId, start, end, PomodoroType.FOCUS);

        Map<LocalDate, long[]> map = aggregateByDate(records);

        List<FocusTimeResponse.FocusData> data = new ArrayList<>();
        long totalDuration = 0;
        int totalPomos = 0;

        LocalDate current = start.toLocalDate();
        LocalDate endDate = end.toLocalDate();
        while (!current.isAfter(endDate)) {
            long[] stats = map.getOrDefault(current, new long[2]);
            FocusTimeResponse.FocusData fd = new FocusTimeResponse.FocusData();
            fd.setDate(current.toString());
            fd.setLabel(current.toString());
            fd.setDuration(stats[0]);
            fd.setPomoCount((int) stats[1]);
            data.add(fd);
            totalDuration += stats[0];
            totalPomos += (int) stats[1];
            current = current.plusDays(1);
        }

        long days = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(start.toLocalDate(), endDate));

        FocusTimeResponse response = new FocusTimeResponse();
        response.setPeriod(period);
        response.setData(data);
        response.setTotalDuration(totalDuration);
        response.setTotalPomos(totalPomos);
        response.setAverageDaily(totalDuration / days);
        return response;
    }

    /** 按日期聚合番茄钟记录 (date → [duration, count]) */
    private Map<LocalDate, long[]> aggregateByDate(List<Pomodoro> records) {
        Map<LocalDate, long[]> map = new TreeMap<>();
        for (Pomodoro p : records) {
            if (!p.getIsInterrupted()) {
                LocalDate d = p.getStartTime().toLocalDate();
                map.computeIfAbsent(d, k -> new long[2]);
                map.get(d)[0] += p.getDuration();
                map.get(d)[1] += 1;
            }
        }
        return map;
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
