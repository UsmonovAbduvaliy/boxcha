package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.response.GetAllGroupsResponse;
import com.example.boxcha.dto.response.GetGroupByIdResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface GroupService {
    List<GetAllGroupsResponse> getAllGroups();

    GetGroupByIdResponse getGroupById(Long id);
}
