package com.skillarena.Springboot.Repository;

import org.springframework.stereotype.Repository;

import com.skillarena.Springboot.Entity.UserEntity;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface UserRepo extends JpaRepository<UserEntity,Long> {
	
	//Find user using email
	UserEntity findByEmail(String email);
	
	//check whether email already exists
	boolean existsByEmail(String email);
}
