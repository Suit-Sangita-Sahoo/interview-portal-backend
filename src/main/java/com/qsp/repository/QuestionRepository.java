package com.qsp.repository;



import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.qsp.Entity.Question;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    List<Question> findBySubject(String subject);

}