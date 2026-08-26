package com.example.boxcha.controller;

import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Group;
import com.example.boxcha.entity.User;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.DailyRepository;
import com.example.boxcha.repo.GroupRepository;
import com.example.boxcha.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ChildrenRepository childrenRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final DailyRepository dailyRepository;

    @GetMapping
    public ResponseEntity<?> dashboard(Authentication authentication) {

        User current = (User) authentication.getPrincipal();

        boolean teacher = current.getAuthorities()
                .stream()
                .anyMatch(a ->
                        "TEACHER".equals(a.getAuthority()) ||
                                "TARBIYACHI".equals(a.getAuthority())
                );

        // Teacher va boshqa userlar uchun grouplarni olish
        List<Group> groups = groupRepository.findAll();

        List<Children> children = groups.stream()
                .flatMap(g ->
                        childrenRepository
                                .findByGroupAndIsActiveTrue(g)
                                .stream()
                )
                .toList();

        List<Map<String, Object>> groupStats = groups.stream()
                .map(g -> {

                    List<Children> groupChildren =
                            childrenRepository.findByGroupAndIsActiveTrue(g);

                    Map<String, Object> m = new LinkedHashMap<>();

                    m.put("id", g.getId());
                    m.put("name", g.getName());
                    m.put("childrenCount", groupChildren.size());

                    return m;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("childrenCount", children.size());
        response.put("groupsCount", groups.size());
        response.put("employeesCount",
                teacher ? 1 : userRepository.count());
        response.put("groups", groupStats);

        return ResponseEntity.ok(response);
    }
}