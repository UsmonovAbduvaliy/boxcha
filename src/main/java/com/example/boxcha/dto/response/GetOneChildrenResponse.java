package com.example.boxcha.dto.response;

import lombok.Value;

import java.time.LocalDate;

@Value
public class GetOneChildrenResponse {
    Long id;
    String firstName;
    String lastName;
    String patronymic;
    Integer age;
    String gender;
    LocalDate birthDate;
    String motherFirstName;
    String motherLastName;
    String fatherFirstName;
    String fatherLastName;
    String motherPhone;
    String fatherPhone;
    String address;
    String groupName;
    Boolean active;
}
