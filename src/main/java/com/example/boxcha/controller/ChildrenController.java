package com.example.boxcha.controller;

import com.example.boxcha.dto.request.AddNewChildrenRequest;
import com.example.boxcha.dto.response.AddNewChildrenResponse;
import com.example.boxcha.dto.response.GetAllChildrenResponse;
import com.example.boxcha.dto.response.GetChildrenByGroupResponse;
import com.example.boxcha.dto.response.GetOneChildrenResponse;
import com.example.boxcha.service.interfaces.ChildrenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/children")
@RequiredArgsConstructor
public class ChildrenController {

    private final ChildrenService childrenService;

    @GetMapping
    public ResponseEntity<?> getAllChildren(){
        List<GetAllChildrenResponse> response = childrenService.getAllChildren();
        return ResponseEntity.ok(response);
    }
    @GetMapping("/group/{id}")
    public ResponseEntity<?> getAllChildrenByGroup(@PathVariable Long id){
       List<GetChildrenByGroupResponse> responses = childrenService.getAllChildrenByGroup(id);
       return ResponseEntity.ok(responses);
    }

    @GetMapping("{id}")
    private ResponseEntity<?> getOneChildren(@PathVariable Long id){
        GetOneChildrenResponse response = childrenService.getOneChildren(id);
        if(response==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    private ResponseEntity<?> addNewChildren(@RequestBody AddNewChildrenRequest request){
        AddNewChildrenResponse response = childrenService.addNewChildren(request);
        if (response==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("{id}")
    private ResponseEntity<?> deleteChildren(@PathVariable Long id){
     boolean deleted = childrenService.deleteChildren(id);
     if (deleted) return ResponseEntity.ok().build();
     return ResponseEntity.notFound().build();
    }

    @PutMapping("{id}")
    private ResponseEntity<?> updateChildren(@PathVariable Long id, @RequestBody AddNewChildrenRequest request){
       AddNewChildrenResponse response = childrenService.updateChildren(id,request);
       if (response==null) return ResponseEntity.notFound().build();
       return ResponseEntity.ok(response);
    }
}
