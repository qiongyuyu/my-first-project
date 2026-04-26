package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.ai.BreakdownTaskRequest;
import com.shiguangyuan.timemaster.dto.request.ai.EvaluateTasksRequest;
import com.shiguangyuan.timemaster.dto.response.ai.AiStatusResponse;
import com.shiguangyuan.timemaster.dto.response.ai.BreakdownResponse;
import com.shiguangyuan.timemaster.dto.response.ai.TaskEvaluationResponse;

public interface AiPlanService {
    TaskEvaluationResponse evaluateTasks(String userId, EvaluateTasksRequest request);
    BreakdownResponse breakdownTask(String userId, BreakdownTaskRequest request);
    AiStatusResponse getAiStatus();
}
