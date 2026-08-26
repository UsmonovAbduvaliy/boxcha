package com.example.boxcha.dto.response;

import lombok.Value;

@Value
public class AddNewChildrenResponse {
    Long id;
    String firstName;
    String lastName;
    String patronymic;
}
