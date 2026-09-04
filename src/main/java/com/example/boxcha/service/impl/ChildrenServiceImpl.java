package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.AddNewChildrenRequest;
import com.example.boxcha.dto.response.AddNewChildrenResponse;
import com.example.boxcha.dto.response.GetAllChildrenResponse;
import com.example.boxcha.dto.response.GetChildrenByGroupResponse;
import com.example.boxcha.dto.response.GetOneChildrenResponse;
import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Group;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.GroupRepository;
import com.example.boxcha.service.interfaces.ChildrenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChildrenServiceImpl implements ChildrenService {

    private final ChildrenRepository childrenRepository;
    private final GroupRepository groupRepository;

    @Override
    public List<GetAllChildrenResponse> getAllChildren() {
        List<GetAllChildrenResponse> responses = new ArrayList<>();
        childrenRepository.findAll().forEach(children -> responses.add(new GetAllChildrenResponse(
                children.getId(),
                children.getFirstName(),
                children.getLastName(),
                children.getPatronymic(),
                children.getAge(),
                children.getGender(),
                children.getIsActive()
        )));
        return responses;
    }

    @Override
    public GetOneChildrenResponse getOneChildren(Long id) {
        Optional<Children> byId = childrenRepository.findById(id);
        if(byId.isPresent()) {
            Children children = byId.get();
            return new GetOneChildrenResponse(
                    children.getId(),
                    children.getFirstName(),
                    children.getLastName(),
                    children.getPatronymic(),
                    children.getAge(),
                    children.getGender(),
                    children.getBirthDate(),
                    children.getMotherFirstName(),
                    children.getMotherLastName(),
                    children.getFatherFirstName(),
                    children.getFatherLastName(),
                    children.getMotherPhone(),
                    children.getFatherPhone(),
                    children.getAddress(),
                    children.getGroup().getName(),
                    children.getIsActive()
            );
        }
        return null;
    }



    @Override
    @Transactional
    public AddNewChildrenResponse addNewChildren(AddNewChildrenRequest request) {
        Optional<Group> byId = groupRepository.findById(request.getGroupId());
        if (byId.isEmpty()){
            return null;
        }
        Children children = Children.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .patronymic(request.getPatronymic())
                .birthDate(request.getBirthDate())
                .motherFirstName(request.getMotherFirstName())
                .motherLastName(request.getMotherLastName())
                .fatherFirstName(request.getFatherFirstName())
                .fatherLastName(request.getFatherLastName())
                .address(request.getAddress())
                .motherPhone(request.getMotherPhone())
                .fatherPhone(request.getFatherPhone())
                .gender(request.getGender())
                .group(byId.get())
                .createdAt(LocalDateTime.now())
                .age(Period.between(request.getBirthDate(), LocalDate.now()).getYears())
                .build();
        Children save = childrenRepository.save(children);
        return new AddNewChildrenResponse(save.getId(), save.getFirstName(), save.getLastName(), save.getPatronymic());
    }

    @Override
    @Transactional
    public boolean deleteChildren(Long id) {
        Optional<Children> byId = childrenRepository.findById(id);
        if(byId.isEmpty())return false;
        Children children = byId.get();
        children.setIsActive(!children.getIsActive());
        childrenRepository.save(children);
        return true;
    }

    @Override
    public AddNewChildrenResponse updateChildren(Long id, AddNewChildrenRequest request) {
        Optional<Children> byId = childrenRepository.findById(id);
        if(byId.isEmpty()) return null;
        Optional<Group> group = groupRepository.findById(request.getGroupId());
        if (group.isEmpty()) return null;
        Children children = byId.get();
        children.setFirstName(request.getFirstName()!=null? request.getFirstName() : children.getFirstName());
        children.setLastName(request.getLastName()!=null? request.getLastName() : children.getLastName());
        children.setPatronymic(request.getPatronymic()!=null? request.getPatronymic() : children.getPatronymic());
        children.setGender(request.getGender()!=null? request.getGender() : children.getGender());
        children.setBirthDate(request.getBirthDate()!=null? request.getBirthDate() : children.getBirthDate());
        children.setMotherFirstName(request.getMotherFirstName() !=null? request.getMotherFirstName() : children.getMotherFirstName());
        children.setMotherLastName(request.getMotherLastName() !=null? request.getMotherLastName() : children.getMotherLastName());
        children.setFatherFirstName(request.getFatherFirstName() !=null? request.getFatherFirstName() : children.getFatherFirstName());
        children.setFatherLastName(request.getFatherLastName()!=null? request.getFatherLastName() : children.getFatherLastName());
        children.setMotherPhone(request.getMotherPhone() !=null? request.getMotherPhone() : children.getMotherPhone());
        children.setFatherPhone(request.getFatherPhone() !=null? request.getFatherPhone() : children.getFatherPhone());
        children.setAddress(request.getAddress() !=null? request.getAddress() : children.getAddress());
        if (children.getBirthDate() != null) {
            children.setAge(Period.between(children.getBirthDate(), LocalDate.now()).getYears());
        }
        children.setGroup(group.get());
        Children save = childrenRepository.save(children);
        return new AddNewChildrenResponse(save.getId(), save.getFirstName(), save.getLastName(), save.getPatronymic());
    }

    @Override
    public List<GetChildrenByGroupResponse> getAllChildrenByGroup(Long id) {
        return childrenRepository.findAll().stream()
                .filter(children -> children.getGroup().getId().equals(id))
                .filter(children -> children.getIsActive().equals(true))
                .map(children -> new GetChildrenByGroupResponse(
                        children.getId(),
                        children.getFirstName(),
                        children.getLastName())).toList();
    }

}
