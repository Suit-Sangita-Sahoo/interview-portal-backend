package com.qsp.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.qsp.Entity.Result;
import com.qsp.Service.ResultService;

@RestController
@RequestMapping("/api/result")
@CrossOrigin("*")
public class ResultController {

    @Autowired
    private ResultService service;

    @PostMapping("/save")
    public Result saveResult(@RequestBody Result result) {
        return service.saveResult(result);
    }
}