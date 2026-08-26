package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.request.AddNewUserRequest;
import com.example.boxcha.dto.request.LoginRequest;
import com.example.boxcha.dto.request.UpdateUserRequest;
import com.example.boxcha.dto.response.AddNewUserResponse;
import com.example.boxcha.dto.response.GetAllUsersResponse;
import com.example.boxcha.dto.response.UpdateUserResponse;
import com.example.boxcha.dto.response.UserResponse;
import com.example.boxcha.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface UserService {

    UserResponse getLoginUser(LoginRequest request);

    List<GetAllUsersResponse> getAllUsers(Pageable pageable);

    List<GetAllUsersResponse> getAllByActiveUsers(Boolean active,Pageable pageable);

    Optional<User> getOneUser(Long id);

    AddNewUserResponse addNewUser(AddNewUserRequest request);

    boolean deleteUser(Long id);

    UpdateUserResponse updateUser(Long id, UpdateUserRequest request);

    List<GetAllUsersResponse> dynamicSearch(String firstName, String lastName,Pageable pageable);
}
