package com.shiguangyuan.timemaster.dto.request.pomodoro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndPomodoroRequest {
    private String endTime;
    private Integer duration;
    private Boolean isInterrupted;
    private String interruptReason;
}
