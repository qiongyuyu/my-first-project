package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.config.WechatConfig;
import com.shiguangyuan.timemaster.dto.request.auth.WechatLoginRequest;
import com.shiguangyuan.timemaster.dto.response.auth.LoginResponse;
import com.shiguangyuan.timemaster.dto.response.auth.TokenResponse;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.entity.UserBadge;
import com.shiguangyuan.timemaster.repository.BadgeRepository;
import com.shiguangyuan.timemaster.repository.UserBadgeRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.security.JwtTokenProvider;
import com.shiguangyuan.timemaster.service.AuthService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final IdGenerator idGenerator;
    private final WechatConfig wechatConfig;
    private final JwtTokenProvider jwtTokenProvider;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Override
    @Transactional
    public LoginResponse wechatLogin(WechatLoginRequest request) {
        String openId;
        if ("mock-app-id".equals(wechatConfig.getAppId())) {
            openId = "mock_openid_" + Math.abs(request.getCode().hashCode());
        } else {
            openId = request.getCode();
        }

        User user = userRepository.findByOpenId(openId).orElse(null);
        boolean isNewUser = (user == null);

        if (isNewUser) {
            user = User.builder()
                    .userId(idGenerator.generateId())
                    .openId(openId)
                    .nickName(request.getUserInfo() != null && request.getUserInfo().getNickName() != null
                            ? request.getUserInfo().getNickName() : "时光用户")
                    .avatarUrl(request.getUserInfo() != null ? request.getUserInfo().getAvatarUrl() : null)
                    .gender(0)
                    .points(1000)
                    .experience(500)
                    .level(5)
                    .theme("light")
                    .fontSize(16)
                    .build();
            user = userRepository.save(user);

            User finalUser = user;
            badgeRepository.findAll().forEach(badge -> {
                UserBadge userBadge = UserBadge.builder()
                        .userBadgeId(idGenerator.generateId())
                        .user(finalUser)
                        .badge(badge)
                        .progress(0)
                        .isUnlocked(false)
                        .build();
                userBadgeRepository.save(userBadge);
            });
        } else if (request.getUserInfo() != null) {
            if (request.getUserInfo().getNickName() != null) {
                user.setNickName(request.getUserInfo().getNickName());
            }
            if (request.getUserInfo().getAvatarUrl() != null) {
                user.setAvatarUrl(request.getUserInfo().getAvatarUrl());
            }
            userRepository.save(user);
        }

        String token = jwtTokenProvider.generateToken(user.getUserId());

        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("theme", user.getTheme());
        settings.put("fontSize", user.getFontSize());
        settings.put("notifications", user.getNotifications());

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setUserId(user.getUserId());
        userInfo.setOpenId(user.getOpenId());
        userInfo.setNickName(user.getNickName());
        userInfo.setAvatarUrl(user.getAvatarUrl());
        userInfo.setPoints(user.getPoints());
        userInfo.setExperience(user.getExperience());
        userInfo.setLevel(user.getLevel());
        userInfo.setSettings(settings);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userInfo);
        return response;
    }

    @Override
    public TokenResponse refreshToken(String userId) {
        String token = jwtTokenProvider.generateToken(userId);
        TokenResponse response = new TokenResponse();
        response.setToken(token);
        response.setExpiresIn(7200L);
        return response;
    }
}
