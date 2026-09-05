package com.example.boxcha.controller;


import com.example.boxcha.dto.request.AddNewOtherRequest;
import com.example.boxcha.dto.request.UpdateOtherRequest;
import com.example.boxcha.dto.response.AddNewOtherResponse;
import com.example.boxcha.dto.response.GetAllOthersResponse;
import com.example.boxcha.dto.response.UpdateOtherResponse;
import com.example.boxcha.service.interfaces.OthersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/others")
@RequiredArgsConstructor
public class OthersController {

    private final OthersService othersService;
    @GetMapping
    public ResponseEntity<?> getAllOthers() {
        List<GetAllOthersResponse> response = othersService.getOthers();
        return ResponseEntity.ok(response);
    }
    @GetMapping("/active")
    public ResponseEntity<?> getAllByActive(@RequestParam Boolean active) {
        List<GetAllOthersResponse> response = othersService.getOthersByActive(active);
        return ResponseEntity.ok(response);
    }
    @GetMapping("{id}")
    public ResponseEntity<?> getOneOther(@PathVariable Long id) {
        GetAllOthersResponse response = othersService.getOneOther(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
    @PostMapping
    public ResponseEntity<?> addOthers(@RequestBody AddNewOtherRequest request) {
        AddNewOtherResponse response = othersService.addNewOther(request);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteOther(@PathVariable Long id) {
        boolean isRemoved = othersService.removeOther(id);
        if (isRemoved) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("{id}")
    public ResponseEntity<?> updateOther(@PathVariable Long id, @RequestBody UpdateOtherRequest request) {
        UpdateOtherResponse response = othersService.updateOther(id, request);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
