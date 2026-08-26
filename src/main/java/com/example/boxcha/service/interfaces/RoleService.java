package com.example.boxcha.service.interfaces;

import com.example.boxcha.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    List<Role> getAllRoles();
}
