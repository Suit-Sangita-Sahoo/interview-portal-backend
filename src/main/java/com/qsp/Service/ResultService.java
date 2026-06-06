package com.qsp.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qsp.Entity.Result;
import com.qsp.repository.ResultRepository;

@Service
public class ResultService {

    @Autowired
    private ResultRepository repository;

    public Result saveResult(Result result) {
        return repository.save(result);
    }
}
