package com.shiguangyuan.timemaster.dto.request.pomodoro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartPomodoroRequest {
    private String taskId;
    private String type;
    private Integer duration;

    public String getType() {
        return type != null ? type : "focus";
    }

    public Integer getDuration() {
        return duration != null ? duration : 1500;
    }
}
