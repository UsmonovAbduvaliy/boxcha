package com.example.boxcha.controller;

import com.example.boxcha.dto.request.AddNewUserRequest;
import com.example.boxcha.dto.request.LoginRequest;
import com.example.boxcha.dto.request.UpdateUserRequest;
import com.example.boxcha.dto.response.*;
import com.example.boxcha.entity.User;
import com.example.boxcha.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login (@RequestBody LoginRequest request) {
        System.out.println("Bu yerga kirdi");
        UserResponse response = userService.getLoginUser(request);
        if(response != null) {
            return ResponseEntity.ok(response);
        }
        System.out.println("xato chiqdi");
        return ResponseEntity.badRequest().build();
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        List<GetAllUsersResponse> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("active/{active}")
    public ResponseEntity<?> getActiveUser(@PathVariable Boolean active,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<GetAllUsersResponse> response = userService.getAllByActiveUsers(active,pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
       GetOneUserResponse user =  userService.getOneUser(id);
       return ResponseEntity.ok(user);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addNewUser(@RequestBody AddNewUserRequest request){
       AddNewUserResponse response =  userService.addNewUser(request);
       if(response!=null) return ResponseEntity.ok(response);
       return ResponseEntity.status(HttpStatus.CONFLICT).body("EMAIL_ALREADY_EXISTS");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        boolean isRemoved = userService.deleteUser(id);
        if (isRemoved){
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request){
        UpdateUserResponse response = userService.updateUser(id,request);
        if(response == null){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        List<GetAllUsersResponse> response = userService.dynamicSearch(firstName, lastName,pageable);
        return ResponseEntity.ok(response);
    }

}