package com.qsp.Service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qsp.Entity.Question;
import com.qsp.repository.QuestionRepository;
@Service
public class QuestionService {

    @Autowired
    private QuestionRepository repository;

    public Question addQuestion(Question question) {

        System.out.println(question.getQuestionText());

        return repository.save(question);
    }

    public List<Question> getQuestionsBySubject(String subject) {
        return repository.findBySubject(subject);
    }
}