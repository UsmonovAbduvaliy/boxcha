package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.request.AddNewChildrenRequest;
import com.example.boxcha.dto.response.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChildrenService {
    List<GetAllChildrenResponse> getAllChildren();

    GetOneChildrenResponse getOneChildren(Long id);

    AddNewChildrenResponse addNewChildren(AddNewChildrenRequest request);

    boolean deleteChildren(Long id);

    AddNewChildrenResponse updateChildren(Long id, AddNewChildrenRequest request);

    List<GetChildrenByGroupResponse> getAllChildrenByGroup(Long id);
}
