package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.request.AddDailyChildrenRequest;
import com.example.boxcha.dto.request.UpdateDailyChildrenRequest;
import com.example.boxcha.dto.response.GetDailyChildrenResponse;
import com.example.boxcha.dto.response.GetOneChildrenDailyResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface DailyService {
    List<GetDailyChildrenResponse> getChildrenDaily(Long id,int year,int month);

    void addDailyChildren(List<AddDailyChildrenRequest> requests);

    boolean updateDailyChildren(UpdateDailyChildrenRequest request);

    GetOneChildrenDailyResponse getOneDaily(Long id);
}
