package com.example.boxcha.service.impl;

import com.example.boxcha.entity.Role;
import com.example.boxcha.repo.RoleRepository;
import com.example.boxcha.service.interfaces.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {


    private final RoleRepository roleRepository;

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll().stream().filter(role -> !role.getRole().equals("ADMIN")&&!role.getRole().equals("SUPER_ADMIN")).toList();
    }
}
