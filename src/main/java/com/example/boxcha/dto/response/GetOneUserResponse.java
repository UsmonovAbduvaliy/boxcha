package com.example.boxcha.dto.response;

import com.example.boxcha.entity.Group;
import com.example.boxcha.entity.User;
import lombok.Value;

@Value
public class GetOneUserResponse {
    User user;
    Group group;
}
