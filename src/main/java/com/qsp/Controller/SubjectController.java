package com.qsp.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.qsp.Entity.Subject;
import com.qsp.repository.SubjectRepository;


@RestController
@RequestMapping("/api/subject")
@CrossOrigin("*")
public class SubjectController {

    @Autowired
    private SubjectRepository repository;

    @PostMapping("/save")
    public Subject saveSubject(@RequestBody Subject subject) {
        return repository.save(subject);
    }
    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }
}
