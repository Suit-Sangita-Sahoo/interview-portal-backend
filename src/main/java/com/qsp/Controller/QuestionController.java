package com.qsp.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.qsp.Entity.Question;
import com.qsp.Service.QuestionService;

@RestController
@RequestMapping("/api/question")
@CrossOrigin("*")
public class QuestionController {

    @Autowired
    private QuestionService service;

    @PostMapping("/")
    public Question addQuestion(@RequestBody Question question) {
        return service.addQuestion(question);
    }

    @GetMapping("/subject/{subject}")
    public List<Question> getQuestionsBySubject(
            @PathVariable String subject) {

        return service.getQuestionsBySubject(subject);
    }
}