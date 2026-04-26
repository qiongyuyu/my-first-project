package com.shiguangyuan.timemaster.service;

import com.shiguangyuan.timemaster.dto.request.social.AddFriendRequest;
import com.shiguangyuan.timemaster.dto.response.social.ActivityResponse;
import com.shiguangyuan.timemaster.dto.response.social.FriendResponse;

public interface FriendService {
    FriendResponse getFriends(String userId);
    FriendResponse.FriendInfo addFriend(String userId, AddFriendRequest request);
    ActivityResponse getFriendActivities(String userId, int page, int limit);
}
