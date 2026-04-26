package com.shiguangyuan.timemaster.dto.request.pomodoro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSyncRequest {
    private List<SyncRecord> records;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncRecord {
        private String pomodoroId;
        private String taskId;
        private String startTime;
        private String endTime;
        private Integer duration;
        private Boolean isInterrupted;
        private String interruptReason;
        private String type;
    }
}
