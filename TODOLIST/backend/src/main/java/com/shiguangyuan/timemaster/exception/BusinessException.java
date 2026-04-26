package com.shiguangyuan.timemaster.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    // Common error codes
    public static final int USER_NOT_FOUND = 1001;
    public static final int PASSWORD_ERROR = 1002;
    public static final int TOKEN_EXPIRED = 1003;
    public static final int TASK_NOT_FOUND = 2001;
    public static final int AI_SERVICE_UNAVAILABLE = 3001;
}
