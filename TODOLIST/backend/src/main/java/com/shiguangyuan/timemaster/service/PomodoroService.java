package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.pomodoro.BatchSyncRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.EndPomodoroRequest;
import com.shiguangyuan.timemaster.dto.request.pomodoro.StartPomodoroRequest;
import com.shiguangyuan.timemaster.dto.response.PageResponse;
import com.shiguangyuan.timemaster.dto.response.pomodoro.BatchSyncResponse;
import com.shiguangyuan.timemaster.dto.response.pomodoro.PomodoroResponse;

public interface PomodoroService {
    PomodoroResponse startPomodoro(String userId, StartPomodoroRequest request);
    void endPomodoro(String userId, String pomodoroId, EndPomodoroRequest request);
    PageResponse<PomodoroResponse> getPomodoroRecords(String userId, String startDate, String endDate,
                                                       String taskId, int page, int limit);
    BatchSyncResponse batchSync(String userId, BatchSyncRequest request);
}
