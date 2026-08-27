package com.example.boxcha.dto.response;

import com.example.boxcha.entity.Group;
import com.example.boxcha.entity.Role;
import lombok.Value;

import java.util.List;

@Value
public class UpdateUserResponse {
    Long id;
    String email;
    String firstName;
    String lastName;
    String phone;
    Group group;
    List<Role> roles;
}
