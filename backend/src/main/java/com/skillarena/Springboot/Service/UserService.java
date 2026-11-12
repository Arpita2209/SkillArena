package com.skillarena.Springboot.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skillarena.Springboot.Repository.UserRepo;

@Service
public class UserService {
	@Autowired
	private UserRepo repo;
	
	
}
