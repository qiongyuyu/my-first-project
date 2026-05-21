package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.auth.PasswordLoginRequest;
import com.shiguangyuan.timemaster.dto.request.auth.PasswordRegisterRequest;
import com.shiguangyuan.timemaster.dto.request.auth.WechatLoginRequest;
import com.shiguangyuan.timemaster.dto.response.auth.LoginResponse;
import com.shiguangyuan.timemaster.dto.response.auth.TokenResponse;

public interface AuthService {
    LoginResponse wechatLogin(WechatLoginRequest request);
    LoginResponse passwordLogin(PasswordLoginRequest request);
    LoginResponse passwordRegister(PasswordRegisterRequest request);
    TokenResponse refreshToken(String userId);
}
