package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.user.UpdateProfileRequest;
import com.shiguangyuan.timemaster.dto.request.user.UpdateSettingsRequest;
import com.shiguangyuan.timemaster.dto.response.user.UserProfileResponse;
import com.shiguangyuan.timemaster.model.entity.User;

public interface UserService {
    UserProfileResponse getProfile(String userId);
    UserProfileResponse updateProfile(String userId, UpdateProfileRequest request);
    void updateSettings(String userId, UpdateSettingsRequest request);
    User getUserById(String userId);
    void addPoints(String userId, int points);
    void addExperience(String userId, int exp);
}
