package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.UpdateGroupTeacher;
import com.example.boxcha.dto.response.GetAllChildrenResponse;
import com.example.boxcha.dto.response.GetAllGroupsResponse;
import com.example.boxcha.dto.response.GetGroupByIdResponse;
import com.example.boxcha.dto.response.UpdateGroupTeacherResponse;
import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Group;
import com.example.boxcha.entity.User;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.GroupRepository;
import com.example.boxcha.repo.UserRepository;
import com.example.boxcha.service.interfaces.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final ChildrenRepository childrenRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public List<GetAllGroupsResponse> getAllGroups() {
        List<Group> all = groupRepository.findAll();
        List<GetAllGroupsResponse> responses = new ArrayList<>();
        all.forEach(group -> {
            responses.add(
                    new GetAllGroupsResponse(
                            group.getId(),
                            group.getName(),
                            group.getTeacher() != null
                                    ? group.getTeacher().getId()
                                    : null
                    )
            );
        });
        return responses;
    }

    @Override
    @Transactional
    public GetGroupByIdResponse getGroupById(Long id) {
        Optional<Group> byId = groupRepository.findById(id);
        if (byId.isEmpty()) return null;
        Group group = byId.get();
        User teacher = group.getTeacher();
        List<Children> children = childrenRepository.findByGroupAndIsActiveTrue(group);

        List<GetAllChildrenResponse> childrenResponses = new ArrayList<>();
        children.forEach(child -> {
            childrenResponses.add(new GetAllChildrenResponse(
                    child.getId(),
                    child.getFirstName(),
                    child.getLastName(),
                    child.getPatronymic(),
                    child.getAge(),
                    child.getGender(),
                    child.getIsActive()
            ));
        });

        return new GetGroupByIdResponse(
                group.getId(),
                group.getName(),
                teacher != null ? teacher.getId() : null,
                teacher != null ? teacher.getFirstName() : null,
                teacher != null ? teacher.getLastName() : null,
                childrenResponses
        );
    }

    public UpdateGroupTeacherResponse updateGroupTeacher(Long id, UpdateGroupTeacher teacher) {
        Optional<Group> byId = groupRepository.findById(id);

        if (byId.isEmpty()) return null;
        Group group = byId.get();
        Optional<User> teacherOptional = userRepository.findById(teacher.getTeacherId());

        if (teacherOptional.isEmpty()) return null;
        // Teacher boshqa groupga biriktirilganmi?
        Optional<Group> existingGroup =
                groupRepository.findByTeacherId(teacher.getTeacherId());

        if (existingGroup.isPresent() && !existingGroup.get().getId().equals(group.getId())) return null;
        group.setTeacher(teacherOptional.get());
        groupRepository.save(group);
        return new UpdateGroupTeacherResponse(group.getId());
    }
}
