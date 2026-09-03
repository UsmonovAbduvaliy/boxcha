package com.example.boxcha.service.impl;

import com.example.boxcha.dto.request.AddDailyChildrenRequest;
import com.example.boxcha.dto.request.UpdateDailyChildrenRequest;
import com.example.boxcha.dto.response.GetDailyChildrenResponse;
import com.example.boxcha.dto.response.GetOneChildrenDailyResponse;
import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Daily;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.DailyRepository;
import com.example.boxcha.service.interfaces.DailyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    @Transactional(readOnly = true)
    public List<GetDailyChildrenResponse> getChildrenDaily(Long id, int year, int month) {
        Optional<Children> byId = childrenRepository.findById(id);

        if (byId.isEmpty()) {
            return null;
        }

        Children children = byId.get();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(
                startDate.lengthOfMonth()
        );

        List<Daily> dailies =
                dailyRepository.findAllByChildrenIdAndDateBetween(
                        children.getId(),
                        startDate,
                        endDate
                );

        List<GetDailyChildrenResponse> responses = new ArrayList<>();

        dailies.forEach(daily ->
                responses.add(
                        new GetDailyChildrenResponse(
                                daily.getId(),
                                daily.getDate(),
                                daily.getIsPresent(),
                                children.getId()
                        )
                )
        );

        return responses;
    }

    @Override
    @Transactional
    public void addDailyChildren(List<AddDailyChildrenRequest> requests) {
        for (AddDailyChildrenRequest request : requests) {
            Optional<Children> childrenOptional =
                    childrenRepository.findById(request.getId());

            if (childrenOptional.isEmpty()) {
                continue;
            }

            Children children =
                    childrenOptional.get();

            Optional<Daily> existingDaily =
                    dailyRepository.findByChildrenIdAndDate(
                            children.getId(),
                            request.getDate()
                    );

            if (existingDaily.isPresent()) {
                Daily daily = existingDaily.get();
                daily.setIsPresent(request.getIsPresent());
            } else {
                Daily daily =
                        Daily.builder()
                                .children(children)
                                .date(request.getDate())
                                .isPresent(request.getIsPresent())
                                .build();
                dailyRepository.save(daily);
            }
        }
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
    public GetOneChildrenDailyResponse getOneDaily(Long id) {
        Optional<Daily> byId = dailyRepository.findById(id);
        if(byId.isEmpty()) return null;
        Daily daily = byId.get();
        return new GetOneChildrenDailyResponse(daily);
    }

}
