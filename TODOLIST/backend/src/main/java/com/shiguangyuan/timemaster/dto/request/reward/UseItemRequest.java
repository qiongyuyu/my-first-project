package com.shiguangyuan.timemaster.dto.request.reward;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UseItemRequest {
    private Integer count;

    public Integer getCount() {
        return count != null ? count : 1;
    }
}
