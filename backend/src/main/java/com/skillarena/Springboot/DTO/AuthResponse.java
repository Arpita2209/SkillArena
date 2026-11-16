
package com.skillarena.Springboot.DTO;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String message;
    private Long userId;
    private String name;
    private String email;
    private String token;
}
