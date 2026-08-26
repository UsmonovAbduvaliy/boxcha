package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.AddDailyChildrenRequest;
import com.example.boxcha.dto.request.UpdateDailyChildrenRequest;
import com.example.boxcha.dto.response.GetDailyChildrenResponse;
import com.example.boxcha.dto.response.UpdateDailyChildrenResponse;
import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Daily;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.DailyRepository;
import com.example.boxcha.service.interfaces.DailyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DailyServiceImpl implements DailyService {

    private final ChildrenRepository childrenRepository;
    private final DailyRepository dailyRepository;

    public DailyServiceImpl(ChildrenRepository childrenRepository, DailyRepository dailyRepository) {
        this.childrenRepository = childrenRepository;
        this.dailyRepository = dailyRepository;
    }

    @Override
    @Transactional
    public List<GetDailyChildrenResponse> getChildrenDaily(Long id) {
        Optional<Children> byId = childrenRepository.findById(id);
        if(byId.isPresent()) {
            Children children = byId.get();
            List<GetDailyChildrenResponse> responses = new ArrayList<>();
            dailyRepository.findAllByChildrenId(children.getId()).forEach(daily->responses.add(new GetDailyChildrenResponse(
                    daily.getId(),
                    daily.getDate(),
                    daily.getIsPresent(),
                    children.getId()
            )));
            return responses;
        }
        return null;
    }

    @Override
    @Transactional
    public void addDailyChildren(List<AddDailyChildrenRequest> requests) {
        List<Daily> dailies = new ArrayList<>();
        for (AddDailyChildrenRequest request : requests) {
            Optional<Children> children = childrenRepository.findById(request.getId());
            if(children.isEmpty()) continue;
            Daily daily = Daily.builder()
                    .children(children.get())
                    .date(request.getDate())
                    .isPresent(request.getIsPresent())
                    .build();
            dailies.add(daily);
        }
        dailyRepository.saveAll(dailies);
    }

    @Override
    @Transactional
    public boolean updateDailyChildren(UpdateDailyChildrenRequest request) {
        Optional<Daily> byId = dailyRepository.findById(request.getId());
        if(byId.isEmpty()) return false;
        Daily daily = byId.get();
        daily.setIsPresent(request.getPresent());
        dailyRepository.save(daily);
        return true;
    }

    @Override
    public UpdateDailyChildrenResponse getOneDaily(Long id) {
        Optional<Daily> byId = dailyRepository.findById(id);
        if(byId.isEmpty()) return null;
        Daily daily = byId.get();
        return new UpdateDailyChildrenResponse(daily.getId(), daily.getDate(),daily.getIsPresent());
    }

}
