package com.shiguangyuan.timemaster.dto.response.pomodoro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroResponse {
    private String pomodoroId;
    private String userId;
    private String taskId;
    private String startTime;
    private String endTime;
    private Integer duration;
    private Boolean isInterrupted;
    private String interruptReason;
    private String type;
    private String createdAt;
}
