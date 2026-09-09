package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.AddNewUserRequest;
import com.example.boxcha.dto.request.LoginRequest;
import com.example.boxcha.dto.request.UpdateUserRequest;
import com.example.boxcha.dto.response.*;
import com.example.boxcha.entity.Group;
import com.example.boxcha.entity.Role;
import com.example.boxcha.entity.User;
import com.example.boxcha.repo.GroupRepository;
import com.example.boxcha.repo.OthersRepository;
import com.example.boxcha.repo.RoleRepository;
import com.example.boxcha.repo.UserRepository;
import com.example.boxcha.security.JwtService;
import com.example.boxcha.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OthersRepository othersRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final GroupRepository groupRepository;

    @Override
    public UserResponse getLoginUser(LoginRequest request) {
        User byEmail = userRepository.findByEmail(request.getEmail());
        System.out.println(request);
        System.out.println(byEmail);
        System.out.println(userRepository.findAll());
        if (byEmail!=null) {
            if (!passwordEncoder.matches(request.getPassword(), byEmail.getPassword())) {
                System.out.println("-----------------");
                return null;
            }
            return new UserResponse(jwtService.generateToken(byEmail),jwtService.generateRefreshToken(byEmail));
        } else {
            return null;
        }
    }

    @Override
    @Transactional
    public List<GetAllUsersResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAllByRolesRoleNotIn(
                List.of("ADMIN", "SUPER_ADMIN"),
                pageable
        );

        return users.getContent().stream()
                .map(user -> new GetAllUsersResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getIsActive(),
                        user.getRoles().stream()
                                .map(Role::getRole)
                                .collect(Collectors.joining(", "))
                ))
                .toList();
    }





    @Override
    @Transactional
    public List<GetAllUsersResponse> getAllByActiveUsers(Boolean active,Pageable pageable) {
        Page<User> users = userRepository.findAllByIsActiveAndRolesRoleNotIn(
                active,
                List.of("ADMIN", "SUPER_ADMIN"),
                pageable
        );


        return users.getContent().stream()
                .map(user -> new GetAllUsersResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getIsActive(),
                        user.getRoles().stream()
                                .map(Role::getRole)
                                .collect(Collectors.joining(", "))
                ))
                .toList();
    }


    @Override
    public GetOneUserResponse getOneUser(Long id) {
        Optional<User> byId = userRepository.findById(id);
        if (byId.isEmpty()) {
            return null;
        }
        User user = byId.get();
        Optional<Group> groupById = groupRepository.findGroupByTeacherId(user.getId());
        Group group = groupById.orElse(null);
        return new GetOneUserResponse(user, group);
    }

    @Override
    @Transactional
    public AddNewUserResponse addNewUser(AddNewUserRequest request) {
        User byEmail = userRepository.findByEmail(request.getEmail());
        if(byEmail!=null) {
            return null;
        }
        Optional<Group> groupById = groupRepository.findById(request.getGroupId());
        if(groupById.isEmpty()) {
            return null;
        }

        Role role = roleRepository.findById(request.getRoleId()).orElse(new Role("TEACHER"));
        Role save = roleRepository.save(role);
        List<Role> roles = List.of(save);
        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isActive(true)
                .phone(request.getPhone())
                .roles(roles)
                .password(passwordEncoder.encode("boxcha001"))
                .build();
        User saved = userRepository.save(user);
        Group group = groupById.get();
        group.setTeacher(saved);
        groupRepository.save(group);
        return new AddNewUserResponse(saved.getId(), saved.getEmail(), saved.getFirstName(), saved.getLastName(), saved.getPhone());
    }

    @Override
    @Transactional
    public boolean deleteUser(Long id) {
        Optional<User> byId = userRepository.findById(id);
        if(byId.isPresent()){
            User user = byId.get();
            user.setIsActive(!user.getIsActive());
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public UpdateUserResponse updateUser(Long id, UpdateUserRequest request) {
        System.out.println(request.getRoleId());
        System.out.println(request.getGroupId());
        System.out.println(id);
        Optional<User> byId = userRepository.findById(id);
        if (byId.isEmpty()) {
            return null;
        }
        Optional<Group> opGroup = groupRepository.findById(request.getGroupId());
        if (opGroup.isEmpty()) {
            return null;
        }
        Group group = opGroup.get();
        User user = byId.get();
        user.setFirstName(request.getFirstName()!=null? request.getFirstName(): user.getFirstName());
        user.setLastName(request.getLastName()!= null?request.getLastName(): user.getLastName());
        user.setEmail(request.getEmail()!=null? request.getEmail(): user.getEmail());
        user.setPhone(request.getPhone()!=null? request.getPhone(): user.getPhone());
        Optional<Role> roleById = roleRepository.getRoleById(request.getRoleId());
        if (roleById.isEmpty()) {
            user.setRoles(null);
        }else {
            user.setRoles(new ArrayList<>(List.of(roleById.get())));
        }
        User savedUser = userRepository.save(user);
        group.setTeacher(savedUser);
        groupRepository.save(group);
        return new UpdateUserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone(),group,user.getRoles());
    }

    @Override
    @Transactional
    public List<GetAllUsersResponse> dynamicSearch(String firstName, String lastName, Pageable pageable) {
        Page<User> users = userRepository.findAllByRolesRoleNotIn(
                List.of("ADMIN", "SUPER_ADMIN"),
                pageable
        );

        return users.getContent().stream()
                .filter(user -> firstName == null || user.getFirstName().toLowerCase().contains(firstName.toLowerCase()))
                .filter(user -> lastName == null || user.getLastName().toLowerCase().contains(lastName.toLowerCase()))
                .map(user -> new GetAllUsersResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getIsActive(),
                        user.getRoles().stream()
                                .map(Role::getRole)
                                .collect(Collectors.joining(", "))
                ))
                .toList();
    }
}