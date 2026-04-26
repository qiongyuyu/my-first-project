package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.user.UpdateProfileRequest;
import com.shiguangyuan.timemaster.dto.request.user.UpdateSettingsRequest;
import com.shiguangyuan.timemaster.dto.response.user.UserProfileResponse;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getProfile(String userId) {
        User user = getUserById(userId);
        return mapToProfile(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        if (request.getNickName() != null) {
            user.setNickName(request.getNickName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getSettings() != null) {
            user.setNotifications(request.getSettings());
        }
        userRepository.save(user);
        return mapToProfile(user);
    }

    @Override
    @Transactional
    public void updateSettings(String userId, UpdateSettingsRequest request) {
        User user = getUserById(userId);
        if (request.getTheme() != null) {
            user.setTheme(request.getTheme());
        }
        if (request.getFontSize() != null) {
            user.setFontSize(request.getFontSize());
        }
        if (request.getNotifications() != null) {
            user.setNotifications(request.getNotifications());
        }
        userRepository.save(user);
    }

    @Override
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));
    }

    @Override
    @Transactional
    public void addPoints(String userId, int points) {
        User user = getUserById(userId);
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void addExperience(String userId, int exp) {
        User user = getUserById(userId);
        user.setExperience(user.getExperience() + exp);
        user.setLevel(user.getExperience() / 100 + 1);
        userRepository.save(user);
    }

    private UserProfileResponse mapToProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getUserId());
        response.setNickName(user.getNickName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setPoints(user.getPoints());
        response.setExperience(user.getExperience());
        response.setLevel(user.getLevel());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("theme", user.getTheme());
        settings.put("fontSize", user.getFontSize());
        settings.put("notifications", user.getNotifications());
        response.setSettings(settings);

        return response;
    }
}
