package com.shiguangyuan.timemaster.controller.task;

import com.shiguangyuan.timemaster.dto.request.task.CreateTaskRequest;
import com.shiguangyuan.timemaster.dto.request.task.UpdateTaskRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ApiResponse<?> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(taskService.getTasks(userId, status, priority, page, limit));
    }

    @PostMapping
    public ApiResponse<?> createTask(@RequestBody @Valid CreateTaskRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(taskService.createTask(userId, request));
    }

    @GetMapping("/{taskId}")
    public ApiResponse<?> getTaskDetail(@PathVariable String taskId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(taskService.getTaskDetail(userId, taskId));
    }

    @PutMapping("/{taskId}")
    public ApiResponse<?> updateTask(@PathVariable String taskId,
                                      @RequestBody UpdateTaskRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(taskService.updateTask(userId, taskId, request));
    }

    @DeleteMapping("/{taskId}")
    public ApiResponse<?> deleteTask(@PathVariable String taskId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        taskService.deleteTask(userId, taskId);
        return ApiResponse.success(null);
    }
}
