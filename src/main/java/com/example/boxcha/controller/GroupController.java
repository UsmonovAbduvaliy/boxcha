package com.example.boxcha.controller;

import com.example.boxcha.dto.request.UpdateGroupTeacher;
import com.example.boxcha.dto.response.GetAllGroupsResponse;
import com.example.boxcha.dto.response.GetGroupByIdResponse;
import com.example.boxcha.dto.response.UpdateGroupTeacherResponse;
import com.example.boxcha.service.interfaces.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    private ResponseEntity<?> getGroups() {
        List<GetAllGroupsResponse> responses = groupService.getAllGroups();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("{id}")
    private ResponseEntity<?> getGroupById(@PathVariable Long id) {
        GetGroupByIdResponse response = groupService.getGroupById(id);
        if (response==null)return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }
    @PutMapping("{id}")
    private ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody UpdateGroupTeacher teacher) {
        UpdateGroupTeacherResponse response = groupService.updateGroupTeacher(id,teacher);
        if (response==null)return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }
}
