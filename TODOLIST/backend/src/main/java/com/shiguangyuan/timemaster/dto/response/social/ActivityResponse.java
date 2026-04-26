package com.shiguangyuan.timemaster.dto.response.social;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private List<ActivityInfo> activities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityInfo {
        private String userId;
        private String nickName;
        private String avatarUrl;
        private String type;
        private String content;
        private String timestamp;
    }
}
