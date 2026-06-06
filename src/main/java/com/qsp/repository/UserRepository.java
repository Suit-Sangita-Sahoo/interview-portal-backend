package com.qsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qsp.Entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

}