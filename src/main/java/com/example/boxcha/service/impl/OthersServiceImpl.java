package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.AddNewOtherRequest;
import com.example.boxcha.dto.request.UpdateOtherRequest;
import com.example.boxcha.dto.response.AddNewOtherResponse;
import com.example.boxcha.dto.response.GetAllOthersResponse;
import com.example.boxcha.dto.response.UpdateOtherResponse;
import com.example.boxcha.entity.Others;
import com.example.boxcha.repo.OthersRepository;
import com.example.boxcha.service.interfaces.OthersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OthersServiceImpl implements OthersService {
    private final OthersRepository othersRepository;

    @Override
    public List<GetAllOthersResponse> getOthers() {
        List<GetAllOthersResponse> responses = new ArrayList<>();
        othersRepository.findAll().forEach(other-> responses.add(new GetAllOthersResponse(
                other.getId(),
                other.getFirstName(),
                other.getLastName(),
                other.getProfession(),
                other.getPhone(),
                other.getDateOfBirth(),
                other.getIsActive()
        )));

        return responses;
    }

    @Override
    public List<GetAllOthersResponse> getOthersByActive(Boolean active) {
        List<GetAllOthersResponse> responses = new ArrayList<>();
        othersRepository.findAllByIsActive(active).forEach(other-> responses.add(new GetAllOthersResponse(
                other.getId(),
                other.getFirstName(),
                other.getLastName(),
                other.getProfession(),
                other.getPhone(),
                other.getDateOfBirth(),
                other.getIsActive()
        )));
        return responses;
    }

    @Override
    public GetAllOthersResponse getOneOther(Long id) {
        Optional<Others> byId = othersRepository.findById(id);
        if(byId.isPresent()){
            Others others = byId.get();
            return new GetAllOthersResponse(
                    others.getId(),
                    others.getFirstName(),
                    others.getLastName(),
                    others.getProfession(),
                    others.getPhone(),
                    others.getDateOfBirth(),
                    others.getIsActive()
            );
        }
        return null;
    }

    @Override
    public AddNewOtherResponse addNewOther(AddNewOtherRequest request) {
        Others others = Others.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .profession(request.getProfession())
                .dateOfBirth(request.getBirthOfDate())
                .isActive(true)
                .build();
        Others save = othersRepository.save(others);
        return new AddNewOtherResponse(save.getId(), save.getFirstName(), save.getLastName(), save.getPhone());
    }

    @Override
    @Transactional
    public boolean removeOther(Long id) {
        Optional<Others> byId = othersRepository.findById(id);
        if(byId.isPresent()){
            Others others = byId.get();
            others.setIsActive(!others.getIsActive());
            othersRepository.save(others);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public UpdateOtherResponse updateOther(Long id, UpdateOtherRequest request) {
        Optional<Others> byId = othersRepository.findById(id);
        if(byId.isPresent()){
            Others others = byId.get();
            others.setFirstName(request.getFirstName()!=null? request.getFirstName(): others.getFirstName());
            others.setLastName(request.getLastName()!=null? request.getLastName() : others.getLastName());
            others.setPhone(request.getPhone()!=null? request.getPhone() : others.getPhone());
            others.setProfession(request.getProfession()!=null? request.getProfession() : others.getProfession());
            others.setDateOfBirth(request.getDateOfBirth()!=null? request.getDateOfBirth(): others.getDateOfBirth());
            Others save = othersRepository.save(others);
            return new UpdateOtherResponse(save.getId(), save.getFirstName(), save.getLastName(), save.getPhone(), save.getProfession(), save.getDateOfBirth());
        }
        return null;
    }
}
