package com.shiguangyuan.timemaster.dto.response.pomodoro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSyncResponse {
    private int successCount;
    private int failedCount;
    private List<String> failedRecords;
}
