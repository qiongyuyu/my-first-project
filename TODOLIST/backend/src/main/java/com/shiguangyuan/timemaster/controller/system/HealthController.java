package com.shiguangyuan.timemaster.controller.system;

import com.shiguangyuan.timemaster.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<?> health() {
        Map<String, Object> data = Map.of(
                "status", "healthy",
                "timestamp", Instant.now().toString(),
                "version", "1.0.0",
                "services", Map.of(
                        "database", "healthy",
                        "cache", "healthy",
                        "ai", "healthy"
                )
        );
        return ApiResponse.success(data);
    }
}
