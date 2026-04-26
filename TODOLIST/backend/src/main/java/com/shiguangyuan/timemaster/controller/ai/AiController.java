package com.shiguangyuan.timemaster.controller.ai;

import com.shiguangyuan.timemaster.dto.request.ai.BreakdownTaskRequest;
import com.shiguangyuan.timemaster.dto.request.ai.EvaluateTasksRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.AiPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiPlanService aiPlanService;

    @PostMapping("/evaluate-tasks")
    public ApiResponse<?> evaluateTasks(@RequestBody EvaluateTasksRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(aiPlanService.evaluateTasks(userId, request));
    }

    @PostMapping("/breakdown-task")
    public ApiResponse<?> breakdownTask(@RequestBody BreakdownTaskRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(aiPlanService.breakdownTask(userId, request));
    }

    @GetMapping("/status")
    public ApiResponse<?> getAiStatus() {
        return ApiResponse.success(aiPlanService.getAiStatus());
    }
}
