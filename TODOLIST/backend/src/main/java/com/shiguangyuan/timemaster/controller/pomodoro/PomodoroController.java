package com.shiguangyuan.timemaster.controller.pomodoro;

import com.shiguangyuan.timemaster.dto.request.pomodoro.BatchSyncRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.EndPomodoroRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.StartPomodoroRequest;
import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import com.shiguangyuan.timemaster.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pomodoros")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/start")
    public ApiResponse<?> startPomodoro(@RequestBody StartPomodoroRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(pomodoroService.startPomodoro(userId, request));
    }

    @PostMapping("/{pomodoroId}/end")
    public ApiResponse<?> endPomodoro(@PathVariable String pomodoroId,
                                       @RequestBody EndPomodoroRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        pomodoroService.endPomodoro(userId, pomodoroId, request);
        return ApiResponse.success(null);
    }

    @GetMapping
    public ApiResponse<?> getPomodoroRecords(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String taskId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(pomodoroService.getPomodoroRecords(userId, startDate, endDate, taskId, page, limit));
    }

    @PostMapping("/batch-sync")
    public ApiResponse<?> batchSync(@RequestBody BatchSyncRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(pomodoroService.batchSync(userId, request));
    }
}
