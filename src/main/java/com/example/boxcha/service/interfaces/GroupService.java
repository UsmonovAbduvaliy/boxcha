package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.request.UpdateGroupTeacher;
import com.example.boxcha.dto.response.GetAllGroupsResponse;
import com.example.boxcha.dto.response.GetGroupByIdResponse;
import com.example.boxcha.dto.response.UpdateGroupTeacherResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface GroupService {
    List<GetAllGroupsResponse> getAllGroups();

    GetGroupByIdResponse getGroupById(Long id);

    UpdateGroupTeacherResponse updateGroupTeacher(Long id, UpdateGroupTeacher teacher);
}
