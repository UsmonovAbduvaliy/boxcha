package com.example.boxcha.dto.request;

import lombok.Value;

@Value
public class AddNewUserRequest {
    String email;
    String firstName;
    String lastName;
    String phone;
    Long roleId;
    Long groupId;
}
