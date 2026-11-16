
package com.skillarena.Springboot.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skillarena.Springboot.DTO.AuthResponse;
import com.skillarena.Springboot.DTO.LoginRequest;
import com.skillarena.Springboot.DTO.RegisterRequest;
import com.skillarena.Springboot.Entity.UserEntity;
import com.skillarena.Springboot.Repository.UserRepo;
import com.skillarena.Springboot.Security.JwtService;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // User Registration
    public AuthResponse registerUser(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (repo.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        UserEntity user = new UserEntity();

        user.setName(request.getName().trim());
        user.setEmail(email);

        // Encrypt password
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        // Save user
        UserEntity savedUser = repo.save(user);

        // Generate JWT token
        String token = jwtService.generateToken(savedUser.getEmail());

        return new AuthResponse(
            "Registration successful",
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            token
        );
    }

    // User Login
    public AuthResponse loginUser(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        UserEntity user = repo.findByEmail(email);

        // Verify email and password
        if (user == null ||
            !passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
            )) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
            "Login successful",
            user.getId(),
            user.getName(),
            user.getEmail(),
            token
        );
    }
}
