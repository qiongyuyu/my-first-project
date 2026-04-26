package com.shiguangyuan.timemaster.service.impl;

import com.shiguangyuan.timemaster.dto.request.social.AddFriendRequest;
import com.shiguangyuan.timemaster.dto.response.social.ActivityResponse;
import com.shiguangyuan.timemaster.dto.response.social.FriendResponse;
import com.shiguangyuan.timemaster.exception.BusinessException;
import com.shiguangyuan.timemaster.exception.ResourceNotFoundException;
import com.shiguangyuan.timemaster.model.entity.Friendship;
import com.shiguangyuan.timemaster.model.entity.Pomodoro;
import com.shiguangyuan.timemaster.model.entity.User;
import com.shiguangyuan.timemaster.model.enums.FriendshipStatus;
import com.shiguangyuan.timemaster.repository.FriendshipRepository;
import com.shiguangyuan.timemaster.repository.PomodoroRepository;
import com.shiguangyuan.timemaster.repository.UserRepository;
import com.shiguangyuan.timemaster.service.FriendService;
import com.shiguangyuan.timemaster.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final IdGenerator idGenerator;
    private final PomodoroRepository pomodoroRepository;

    @Override
    public FriendResponse getFriends(String userId) {
        List<Friendship> friendships = friendshipRepository.findByUserUserIdAndStatus(userId, FriendshipStatus.ACCEPTED);
        List<FriendResponse.FriendInfo> friends = friendships.stream().map(f -> {
            FriendResponse.FriendInfo info = new FriendResponse.FriendInfo();
            info.setFriendId(f.getFriend().getUserId());
            info.setNickName(f.getFriend().getNickName());
            info.setAvatarUrl(f.getFriend().getAvatarUrl());
            info.setStatus(f.getStatus().name().toLowerCase());
            info.setCreatedAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : null);
            return info;
        }).collect(Collectors.toList());

        FriendResponse response = new FriendResponse();
        response.setFriends(friends);
        return response;
    }

    @Override
    @Transactional
    public FriendResponse.FriendInfo addFriend(String userId, AddFriendRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));

        User friend = userRepository.findById(request.getFriendId())
                .orElseThrow(() -> new ResourceNotFoundException("用户", request.getFriendId()));

        if (friendshipRepository.existsByUserUserIdAndFriendUserId(userId, request.getFriendId())) {
            throw new BusinessException(400, "已发送过好友请求");
        }

        Friendship friendship = Friendship.builder()
                .friendshipId(idGenerator.generateId())
                .user(user)
                .friend(friend)
                .status(FriendshipStatus.PENDING)
                .build();
        friendshipRepository.save(friendship);

        FriendResponse.FriendInfo info = new FriendResponse.FriendInfo();
        info.setFriendId(friend.getUserId());
        info.setNickName(friend.getNickName());
        info.setAvatarUrl(friend.getAvatarUrl());
        info.setStatus("pending");
        info.setCreatedAt(LocalDateTime.now().toString());
        return info;
    }

    @Override
    public ActivityResponse getFriendActivities(String userId, int page, int limit) {
        List<Friendship> friendships = friendshipRepository.findByUserUserIdAndStatus(userId, FriendshipStatus.ACCEPTED);
        List<ActivityResponse.ActivityInfo> activities = new ArrayList<>();

        for (Friendship f : friendships) {
            List<Pomodoro> recentPomos = pomodoroRepository.findByUserUserIdAndStartTimeBetween(
                    f.getFriend().getUserId(),
                    LocalDateTime.now().minusHours(24),
                    LocalDateTime.now());

            for (Pomodoro p : recentPomos) {
                ActivityResponse.ActivityInfo activity = new ActivityResponse.ActivityInfo();
                activity.setUserId(f.getFriend().getUserId());
                activity.setNickName(f.getFriend().getNickName());
                activity.setAvatarUrl(f.getFriend().getAvatarUrl());
                activity.setType("pomodoro_completed");
                activity.setContent("完成了番茄钟");
                activity.setTimestamp(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
                activities.add(activity);
            }
        }

        activities.sort((a, b) -> {
            if (a.getTimestamp() == null) return 1;
            if (b.getTimestamp() == null) return -1;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        int start = (page - 1) * limit;
        List<ActivityResponse.ActivityInfo> paged = activities.stream()
                .skip(start)
                .limit(limit)
                .collect(Collectors.toList());

        ActivityResponse response = new ActivityResponse();
        response.setActivities(paged);
        return response;
    }
}
