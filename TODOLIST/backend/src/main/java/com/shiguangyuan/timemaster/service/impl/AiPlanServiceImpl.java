package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.ai.BreakdownTaskRequest;
import com.shiguangyuan.timemaster.dto.request.ai.EvaluateTasksRequest;
import com.shiguangyuan.timemaster.dto.response.ai.AiStatusResponse;
import com.shiguangyuan.timemaster.dto.response.ai.BreakdownResponse;
import com.shiguangyuan.timemaster.dto.response.ai.TaskEvaluationResponse;
import com.shiguangyuan.timemaster.service.AiPlanService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiPlanServiceImpl implements AiPlanService {

    private final Random random = new Random();

    @Override
    public TaskEvaluationResponse evaluateTasks(String userId, EvaluateTasksRequest request) {
        List<TaskEvaluationResponse.Evaluation> evaluations = new ArrayList<>();

        final double urgencyWeight = request.getWeights() != null
                ? request.getWeights().getUrgency() / 100.0 : 0.5;
        final double importanceWeight = request.getWeights() != null
                ? request.getWeights().getImportance() / 100.0 : 0.5;

        for (EvaluateTasksRequest.TaskInfo task : request.getTasks()) {
            int urgencyScore = calculateUrgencyScore(task, request.getTasks().size());
            int importanceScore = calculateImportanceScore(task, request.getTasks().size());

            TaskEvaluationResponse.Evaluation eval = new TaskEvaluationResponse.Evaluation();
            eval.setTaskId(task.getTaskId());
            eval.setUrgencyScore(urgencyScore);
            eval.setImportanceScore(importanceScore);

            if (urgencyScore >= 70 && importanceScore >= 70) {
                eval.setQuadrant("important-urgent");
            } else if (urgencyScore >= 70) {
                eval.setQuadrant("urgent-not-important");
            } else if (importanceScore >= 70) {
                eval.setQuadrant("important-not-urgent");
            } else {
                eval.setQuadrant("not-urgent-not-important");
            }

            evaluations.add(eval);
        }

        evaluations.sort((a, b) -> {
            double scoreA = a.getUrgencyScore() * urgencyWeight + a.getImportanceScore() * importanceWeight;
            double scoreB = b.getUrgencyScore() * urgencyWeight + b.getImportanceScore() * importanceWeight;
            return Double.compare(scoreB, scoreA);
        });

        for (int i = 0; i < evaluations.size(); i++) {
            evaluations.get(i).setRecommendedOrder(i + 1);
        }

        TaskEvaluationResponse response = new TaskEvaluationResponse();
        response.setEvaluations(evaluations);
        return response;
    }

    @Override
    public BreakdownResponse breakdownTask(String userId, BreakdownTaskRequest request) {
        List<String> steps = new ArrayList<>();
        String complexity = request.getComplexity() != null ? request.getComplexity() : "medium";

        switch (complexity.toLowerCase()) {
            case "low":
                steps.add("明确任务目标和范围");
                steps.add("制定执行计划");
                steps.add("完成并检查结果");
                break;
            case "high":
                steps.add("明确任务总体目标和边界");
                steps.add("收集必要资料和信息");
                steps.add("分析任务的难点和风险点");
                steps.add("制定详细执行步骤和时间表");
                steps.add("分阶段逐步推进");
                steps.add("设置检查点和反馈机制");
                steps.add("最终审查和总结");
                break;
            default:
                steps.add("明确任务目标和范围");
                steps.add("收集必要资料和信息");
                steps.add("制定详细执行步骤");
                steps.add("分配时间和资源");
                steps.add("设置检查点和反馈机制");
        }

        BreakdownResponse response = new BreakdownResponse();
        response.setTaskId(request.getTaskId());
        response.setBreakdown(steps);
        return response;
    }

    @Override
    public AiStatusResponse getAiStatus() {
        AiStatusResponse response = new AiStatusResponse();
        response.setAvailable(true);
        response.setResponseTime(0L);
        response.setModel("mock");
        AiStatusResponse.RateLimit rateLimit = new AiStatusResponse.RateLimit();
        rateLimit.setRemaining(999);
        rateLimit.setLimit(1000);
        rateLimit.setResetAt(null);
        response.setRateLimit(rateLimit);
        return response;
    }

    private int calculateUrgencyScore(EvaluateTasksRequest.TaskInfo task, int totalTasks) {
        int base = 30 + random.nextInt(30);
        if (task.getDeadline() != null) {
            base += 15;
        }
        return Math.min(base + random.nextInt(15), 100);
    }

    private int calculateImportanceScore(EvaluateTasksRequest.TaskInfo task, int totalTasks) {
        int base = 35 + random.nextInt(25);
        if (task.getDescription() != null && task.getDescription().length() > 20) {
            base += 10;
        }
        return Math.min(base + random.nextInt(15), 100);
    }
}
