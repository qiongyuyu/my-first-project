package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.pomodoro.BatchSyncRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.EndPomodoroRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.StartPomodoroRequest;
import com.shiguangyuan.timemaster.dto.response.PageResponse;
import com.shiguangyuan.timemaster.dto.response.pomodoro.BatchSyncResponse;
import com.shiguangyuan.timemaster.dto.response.pomodoro.PomodoroResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.Pomodoro;
import com.shiguangyuan.timemaster.model.entity.Task;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.enums.PomodoroType;
import com.shiguangyuan.timemaster.model.enums.SyncStatus;
import com.shiguangyuan.timemaster.repository.PomodoroRepository;
import com.shiguangyuan.timemaster.repository.TaskRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.service.PomodoroService;
import com.shiguangyuan.timemaster.service.UserService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PomodoroServiceImpl implements PomodoroService {

    private final PomodoroRepository pomodoroRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final IdGenerator idGenerator;
    private final UserService userService;

    @Override
    @Transactional
    public PomodoroResponse startPomodoro(String userId, StartPomodoroRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        Task task = null;
        if (request.getTaskId() != null && !request.getTaskId().isEmpty()) {
            task = taskRepository.findById(request.getTaskId()).orElse(null);
        }

        Pomodoro pomodoro = Pomodoro.builder()
                .pomodoroId(idGenerator.generateId())
                .user(user)
                .task(task)
                .type(request.getType() != null ? PomodoroType.valueOf(request.getType().toUpperCase()) : PomodoroType.FOCUS)
                .startTime(LocalDateTime.now())
                .expectedDuration(request.getDuration() != null ? request.getDuration() : 1500)
                .duration(0)
                .isInterrupted(false)
                .syncStatus(SyncStatus.SYNCED)
                .build();

        pomodoro = pomodoroRepository.save(pomodoro);
        return mapToResponse(pomodoro);
    }

    @Override
    @Transactional
    public void endPomodoro(String userId, String pomodoroId, EndPomodoroRequest request) {
        Pomodoro pomodoro = pomodoroRepository.findById(pomodoroId)
                .orElseThrow(() -> new ResourceNotFoundException("番茄钟", pomodoroId));

        if (!pomodoro.getUser().getUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作此番茄钟");
        }

        pomodoro.setEndTime(request.getEndTime() != null
                ? LocalDateTime.parse(request.getEndTime())
                : LocalDateTime.now());
        pomodoro.setDuration(request.getDuration() != null ? request.getDuration() : 0);
        pomodoro.setIsInterrupted(request.getIsInterrupted() != null && request.getIsInterrupted());
        pomodoro.setInterruptReason(request.getInterruptReason());

        if (!pomodoro.getIsInterrupted() && pomodoro.getType() == PomodoroType.FOCUS) {
            userService.addPoints(userId, 10);
            double hours = pomodoro.getDuration() / 3600.0;
            int exp = (int) (hours * 10);
            if (exp > 0) {
                userService.addExperience(userId, exp);
            }

            if (pomodoro.getTask() != null) {
                Task task = pomodoro.getTask();
                task.setCompletedPomos(task.getCompletedPomos() + 1);
                if (task.getEstimatedPomos() > 0) {
                    int progress = (int) ((double) task.getCompletedPomos() / task.getEstimatedPomos() * 100);
                    task.setProgress(Math.min(progress, 100));
                }
                taskRepository.save(task);
            }
        }

        pomodoroRepository.save(pomodoro);
    }

    @Override
    public PageResponse<PomodoroResponse> getPomodoroRecords(String userId, String startDate, String endDate,
                                                               String taskId, int page, int limit) {
        PageRequest pageable = PageRequest.of(page - 1, limit);

        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            List<Pomodoro> records = pomodoroRepository.findByUserUserIdAndStartTimeBetween(userId, start, end);
            List<PomodoroResponse> items = records.stream()
                    .skip((long) (page - 1) * limit)
                    .limit(limit)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            return PageResponse.<PomodoroResponse>builder()
                    .items(items)
                    .total(records.size())
                    .page(page)
                    .limit(limit)
                    .build();
        }

        Page<Pomodoro> pomodoroPage = pomodoroRepository.findByUserUserIdOrderByStartTimeDesc(userId, pageable);
        List<PomodoroResponse> items = pomodoroPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<PomodoroResponse>builder()
                .items(items)
                .total(pomodoroPage.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    @Override
    @Transactional
    public BatchSyncResponse batchSync(String userId, BatchSyncRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        int successCount = 0;
        int failedCount = 0;
        List<String> failedRecords = new ArrayList<>();

        for (BatchSyncRequest.SyncRecord record : request.getRecords()) {
            try {
                if (!pomodoroRepository.findById(record.getPomodoroId()).isPresent()) {
                    Task task = null;
                    if (record.getTaskId() != null && !record.getTaskId().isEmpty()) {
                        task = taskRepository.findById(record.getTaskId()).orElse(null);
                    }

                    Pomodoro pomodoro = Pomodoro.builder()
                            .pomodoroId(record.getPomodoroId())
                            .user(user)
                            .task(task)
                            .type(record.getType() != null ? PomodoroType.valueOf(record.getType().toUpperCase()) : PomodoroType.FOCUS)
                            .startTime(record.getStartTime() != null ? LocalDateTime.parse(record.getStartTime()) : LocalDateTime.now())
                            .endTime(record.getEndTime() != null ? LocalDateTime.parse(record.getEndTime()) : null)
                            .duration(record.getDuration() != null ? record.getDuration() : 0)
                            .isInterrupted(record.getIsInterrupted() != null && record.getIsInterrupted())
                            .interruptReason(record.getInterruptReason())
                            .syncStatus(SyncStatus.SYNCED)
                            .build();
                    pomodoroRepository.save(pomodoro);
                    successCount++;
                }
            } catch (Exception e) {
                failedCount++;
                failedRecords.add(record.getPomodoroId());
            }
        }

        BatchSyncResponse response = new BatchSyncResponse();
        response.setSuccessCount(successCount);
        response.setFailedCount(failedCount);
        response.setFailedRecords(failedRecords);
        return response;
    }

    private PomodoroResponse mapToResponse(Pomodoro p) {
        PomodoroResponse response = new PomodoroResponse();
        response.setPomodoroId(p.getPomodoroId());
        response.setUserId(p.getUser().getUserId());
        response.setTaskId(p.getTask() != null ? p.getTask().getTaskId() : null);
        response.setStartTime(p.getStartTime() != null ? p.getStartTime().toString() : null);
        response.setEndTime(p.getEndTime() != null ? p.getEndTime().toString() : null);
        response.setDuration(p.getDuration());
        response.setIsInterrupted(p.getIsInterrupted());
        response.setInterruptReason(p.getInterruptReason());
        response.setType(p.getType() != null ? p.getType().name().toLowerCase() : null);
        response.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return response;
    }
}
