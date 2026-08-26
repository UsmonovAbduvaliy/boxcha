package com.example.boxcha.dto.response;


import lombok.Value;

import java.util.List;

@Value
public class GetGroupByIdResponse {
    Long id;
    String groupName;
    Long teacherId;
    String teacherFirstname;
    String teacherLastname;
    List<GetAllChildrenResponse> children;
}
