
package com.skillarena.Springboot.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.skillarena.Springboot.DTO.AuthResponse;
import com.skillarena.Springboot.DTO.LoginRequest;
import com.skillarena.Springboot.DTO.RegisterRequest;
import com.skillarena.Springboot.Service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    // Test API
    @GetMapping("/hello")
    public String test() {
        return "Welcome to SkillArena!";
    }
    @GetMapping("/protected")
    public String protectedEndpoint() {
        return "JWT Authentication Successful! Welcome to SkillArena.";
    }
     // User Registration API
    @PostMapping("/auth/register")
    public AuthResponse registerUser(
            @Valid @RequestBody RegisterRequest request) {

        return userService.registerUser(request);
    }

    // User Login API
    @PostMapping("/auth/login")
    public AuthResponse loginUser(
            @Valid @RequestBody LoginRequest request) {

        return userService.loginUser(request);
    }
}
