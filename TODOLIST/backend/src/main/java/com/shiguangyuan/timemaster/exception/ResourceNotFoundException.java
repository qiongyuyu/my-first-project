package com.shiguangyuan.timemaster.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, String id) {
        super(404, resource + " 不存在: " + id);
    }
}
