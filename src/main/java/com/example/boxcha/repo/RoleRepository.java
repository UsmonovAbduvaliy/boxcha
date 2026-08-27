package com.example.boxcha.repo;

import com.example.boxcha.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRole(String name);

    Optional<Role> getRoleById (Long roleId);
}