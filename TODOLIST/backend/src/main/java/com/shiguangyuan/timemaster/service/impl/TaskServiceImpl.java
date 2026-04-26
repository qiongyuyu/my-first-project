package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.task.CreateTaskRequest;
import com.shiguangyuan.timemaster.dto.request.task.UpdateTaskRequest;
import com.shiguangyuan.timemaster.dto.response.PageResponse;
import com.shiguangyuan.timemaster.dto.response.task.TaskResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.Task;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.enums.TaskPriority;
import com.shiguangyuan.timemaster.model.enums.TaskQuadrant;
import com.shiguangyuan.timemaster.model.enums.TaskStatus;
import com.shiguangyuan.timemaster.repository.TaskRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.service.TaskService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final IdGenerator idGenerator;

    @Override
    public PageResponse<TaskResponse> getTasks(String userId, String status, String priority, int page, int limit) {
        PageRequest pageable = PageRequest.of(page - 1, limit);
        Page<Task> taskPage;
        if (status != null && !status.isEmpty()) {
            TaskStatus taskStatus = TaskStatus.valueOf(status.toUpperCase());
            taskPage = taskRepository.findByUserUserIdAndStatus(userId, taskStatus, pageable);
        } else if (priority != null && !priority.isEmpty()) {
            taskPage = taskRepository.findByUserUserIdAndPriority(userId, priority, pageable);
        } else {
            taskPage = taskRepository.findByUserUserId(userId, pageable);
        }
        List<TaskResponse> tasks = taskPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<TaskResponse>builder()
                .items(tasks)
                .total(taskPage.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    @Override
    @Transactional
    public TaskResponse createTask(String userId, CreateTaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        Task task = Task.builder()
                .taskId(idGenerator.generateId())
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null
                        ? TaskPriority.valueOf(request.getPriority().toUpperCase())
                        : TaskPriority.MEDIUM)
                .estimatedPomos(request.getEstimatedPomos() != null ? request.getEstimatedPomos() : 1)
                .status(TaskStatus.PENDING)
                .progress(0)
                .tags(request.getTags())
                .build();

        if (request.getDeadline() != null) {
            task.setDeadline(LocalDateTime.parse(request.getDeadline()));
        }

        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(String userId, String taskId, UpdateTaskRequest request) {
        Task task = getOwnedTask(userId, taskId);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDeadline() != null) task.setDeadline(LocalDateTime.parse(request.getDeadline()));
        if (request.getPriority() != null) task.setPriority(TaskPriority.valueOf(request.getPriority().toUpperCase()));
        if (request.getStatus() != null) task.setStatus(TaskStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getQuadrant() != null) task.setQuadrant(TaskQuadrant.valueOf(request.getQuadrant().toUpperCase()));
        if (request.getCompletedPomos() != null) task.setCompletedPomos(request.getCompletedPomos());
        if (request.getEstimatedPomos() != null) task.setEstimatedPomos(request.getEstimatedPomos());
        if (request.getProgress() != null) {
            task.setProgress(request.getProgress());
        } else if (task.getEstimatedPomos() > 0) {
            int progress = (int) ((double) task.getCompletedPomos() / task.getEstimatedPomos() * 100);
            task.setProgress(Math.min(progress, 100));
        }
        if (TaskStatus.COMPLETED.equals(task.getStatus())) {
            task.setProgress(100);
        }

        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public void deleteTask(String userId, String taskId) {
        Task task = getOwnedTask(userId, taskId);
        taskRepository.delete(task);
    }

    @Override
    public TaskResponse getTaskDetail(String userId, String taskId) {
        Task task = getOwnedTask(userId, taskId);
        return mapToResponse(task);
    }

    private Task getOwnedTask(String userId, String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("任务", taskId));
        if (!task.getUser().getUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作此任务");
        }
        return task;
    }

    public TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getTaskId());
        response.setUserId(task.getUser().getUserId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDeadline(task.getDeadline() != null ? task.getDeadline().toString() : null);
        response.setPriority(task.getPriority() != null ? task.getPriority().name().toLowerCase() : null);
        response.setQuadrant(task.getQuadrant() != null ? task.getQuadrant().name() : null);
        response.setBreakdown(task.getBreakdown());
        response.setStatus(task.getStatus() != null ? task.getStatus().name().toLowerCase() : null);
        response.setEstimatedPomos(task.getEstimatedPomos());
        response.setCompletedPomos(task.getCompletedPomos());
        response.setProgress(task.getProgress());
        response.setTags(task.getTags());
        response.setCreatedAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
        response.setUpdatedAt(task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null);
        return response;
    }
}
