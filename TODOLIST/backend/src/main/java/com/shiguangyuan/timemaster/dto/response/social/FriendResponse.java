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
public class FriendResponse {
    private List<FriendInfo> friends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendInfo {
        private String friendId;
        private String nickName;
        private String avatarUrl;
        private String status;
        private String createdAt;
    }
}
