package com.shiguangyuan.timemaster.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {
    private String theme;
    private Integer fontSize;
    private Map<String, Object> notifications;
}
