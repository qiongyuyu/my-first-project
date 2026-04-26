package com.shiguangyuan.timemaster.dto.request.social;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddFriendRequest {
    @NotBlank(message = "好友ID不能为空")
    private String friendId;
}
