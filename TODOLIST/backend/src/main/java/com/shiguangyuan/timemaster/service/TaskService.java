package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.task.CreateTaskRequest;
import com.shiguangyuan.timemaster.dto.request.task.UpdateTaskRequest;
import com.shiguangyuan.timemaster.dto.response.PageResponse;
import com.shiguangyuan.timemaster.dto.response.task.TaskResponse;

public interface TaskService {
    PageResponse<TaskResponse> getTasks(String userId, String status, String priority, int page, int limit);
    TaskResponse createTask(String userId, CreateTaskRequest request);
    TaskResponse updateTask(String userId, String taskId, UpdateTaskRequest request);
    void deleteTask(String userId, String taskId);
    TaskResponse getTaskDetail(String userId, String taskId);
}
