package com.qsp.Service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qsp.Entity.User;
import com.qsp.repository.UserRepository;


@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User register(User user) {
        return repository.save(user);
    }

    public User getUserById(Integer id) {
        return repository.findById(id).orElse(null);
    }
}