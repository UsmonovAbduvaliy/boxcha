package com.example.boxcha.controller;

import com.example.boxcha.dto.response.GetAllGroupsResponse;
import com.example.boxcha.dto.response.GetGroupByIdResponse;
import com.example.boxcha.service.interfaces.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
