package com.example.boxcha.dto.request;

import lombok.Value;

import java.time.LocalDate;

@Value
public class AddNewChildrenRequest {
    String firstName;
    String lastName;
    String patronymic;
    String gender;
    LocalDate birthDate;
    String motherFirstName;
    String motherLastName;
    String fatherFirstName;
    String fatherLastName;
    String motherPhone;
    String fatherPhone;
    Long groupId;
    String address;
}
