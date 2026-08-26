package com.example.boxcha.controller;

import com.example.boxcha.dto.request.AddDailyChildrenRequest;
import com.example.boxcha.dto.request.UpdateDailyChildrenRequest;
import com.example.boxcha.dto.response.GetDailyChildrenResponse;
import com.example.boxcha.dto.response.UpdateDailyChildrenResponse;
import com.example.boxcha.service.interfaces.DailyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/daily")
@RequiredArgsConstructor
public class DailyController {

    private final DailyService dailyService;

    @GetMapping("/children/{id}")
    private ResponseEntity<?> getDailyChildren(@PathVariable Long id){
        List<GetDailyChildrenResponse> responses = dailyService.getChildrenDaily(id);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("{id}")
    private ResponseEntity<?> getOneDaily(@PathVariable Long id){
        UpdateDailyChildrenResponse response = dailyService.getOneDaily(id);
        if(response==null)return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    private ResponseEntity<?> addDailyChildren(@RequestBody List<AddDailyChildrenRequest> requests){
        dailyService.addDailyChildren(requests);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    private ResponseEntity<?> updateDaily( @RequestBody UpdateDailyChildrenRequest request){
        boolean updated = dailyService.updateDailyChildren(request);
        if (!updated)return ResponseEntity.badRequest().build();
        return ResponseEntity.ok().build();
    }

}
