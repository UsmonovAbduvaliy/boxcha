package com.example.boxcha.service.interfaces;

import com.example.boxcha.dto.request.AddNewOtherRequest;
import com.example.boxcha.dto.request.UpdateOtherRequest;
import com.example.boxcha.dto.response.AddNewOtherResponse;
import com.example.boxcha.dto.response.GetAllOthersResponse;
import com.example.boxcha.dto.response.UpdateOtherResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OthersService {

    List<GetAllOthersResponse> getOthers();

    List<GetAllOthersResponse> getOthersByActive(Boolean active);

    GetAllOthersResponse getOneOther(Long id);

    AddNewOtherResponse addNewOther(AddNewOtherRequest request);

    boolean removeOther(Long id);

    UpdateOtherResponse updateOther(Long id, UpdateOtherRequest request);
}
