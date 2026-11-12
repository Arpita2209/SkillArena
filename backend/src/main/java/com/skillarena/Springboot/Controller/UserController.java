
package com.skillarena.Springboot.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.skillarena.Springboot.Service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService Service;

    @GetMapping("/hello")
    public String test() {
        return "welcome to skillArena";
    }
}

