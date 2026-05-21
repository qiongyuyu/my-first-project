package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.config.WechatConfig;
import com.shiguangyuan.timemaster.dto.request.auth.PasswordLoginRequest;
import com.shiguangyuan.timemaster.dto.request.auth.PasswordRegisterRequest;
import com.shiguangyuan.timemaster.dto.request.auth.WechatLoginRequest;
import com.shiguangyuan.timemaster.dto.response.auth.LoginResponse;
import com.shiguangyuan.timemaster.dto.response.auth.TokenResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.entity.UserBadge;
import com.shiguangyuan.timemaster.repository.BadgeRepository;
import com.shiguangyuan.timemaster.repository.UserBadgeRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.security.JwtTokenProvider;
import com.shiguangyuan.timemaster.service.AuthService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public LoginResponse wechatLogin(WechatLoginRequest request) {
        String openId = resolveOpenId(request.getCode());

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
            initBadgesForNewUser(user);
        } else if (request.getUserInfo() != null) {
            if (request.getUserInfo().getNickName() != null) {
                user.setNickName(request.getUserInfo().getNickName());
            }
            if (request.getUserInfo().getAvatarUrl() != null) {
                user.setAvatarUrl(request.getUserInfo().getAvatarUrl());
            }
            userRepository.save(user);
        }

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse passwordLogin(PasswordLoginRequest request) {
        String openId = resolveOpenId(request.getCode());

        User user = userRepository.findByOpenId(openId)
                .orElseThrow(() -> new BusinessException(BusinessException.USER_NOT_FOUND, "用户不存在，请先注册"));

        if (user.getPassword() == null) {
            throw new BusinessException(BusinessException.PASSWORD_NOT_SET, "您的账号尚未设置密码，请使用微信一键登录");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(BusinessException.PASSWORD_ERROR, "密码错误");
        }

        boolean updated = false;
        if (request.getNickName() != null && !request.getNickName().isEmpty()) {
            user.setNickName(request.getNickName());
            updated = true;
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse passwordRegister(PasswordRegisterRequest request) {
        String openId = resolveOpenId(request.getCode());

        User existingUser = userRepository.findByOpenId(openId).orElse(null);
        boolean isNewUser = (existingUser == null);

        User user;
        if (isNewUser) {
            user = User.builder()
                    .userId(idGenerator.generateId())
                    .openId(openId)
                    .nickName(request.getNickName())
                    .avatarUrl(request.getAvatarUrl())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .gender(0)
                    .points(1000)
                    .experience(500)
                    .level(5)
                    .theme("light")
                    .fontSize(16)
                    .build();
            user = userRepository.save(user);
            initBadgesForNewUser(user);
        } else {
            if (existingUser.getPassword() != null) {
                throw new BusinessException(BusinessException.USER_ALREADY_EXISTS, "该微信账号已注册，请直接登录");
            }
            existingUser.setNickName(request.getNickName());
            existingUser.setAvatarUrl(request.getAvatarUrl());
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            user = userRepository.save(existingUser);
        }

        return buildLoginResponse(user);
    }

    @Override
    public TokenResponse refreshToken(String userId) {
        String token = jwtTokenProvider.generateToken(userId);
        TokenResponse response = new TokenResponse();
        response.setToken(token);
        response.setExpiresIn(7200L);
        return response;
    }

    private String resolveOpenId(String code) {
        if ("mock-app-id".equals(wechatConfig.getAppId())) {
            return "mock_openid_user";
        }
        return code;
    }

    private void initBadgesForNewUser(User user) {
        badgeRepository.findAll().forEach(badge -> {
            UserBadge userBadge = UserBadge.builder()
                    .userBadgeId(idGenerator.generateId())
                    .user(user)
                    .badge(badge)
                    .progress(0)
                    .isUnlocked(false)
                    .build();
            userBadgeRepository.save(userBadge);
        });
    }

    private LoginResponse buildLoginResponse(User user) {
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
}
