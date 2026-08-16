package secureassess.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import secureassess.entity.User;
import secureassess.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }


    // ========================================
    // REGISTER
    // POST /api/auth/register
    // ========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            User user =
                    userService.registerUser(
                            request.name(),
                            request.email(),
                            request.password(),
                            request.role()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new RegisterResponse(
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getRole()
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // LOGIN
    // POST /api/auth/login
    // ========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            User user =
                    userService.loginUser(
                            request.email(),
                            request.password()
                    );

            return ResponseEntity.ok(
                    new LoginResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // REGISTER REQUEST
    // ========================================

    public record RegisterRequest(
            String name,
            String email,
            String password,
            User.Role role
    ) {
    }


    // ========================================
    // REGISTER RESPONSE
    // ========================================

    public record RegisterResponse(
            Long id,
            String name,
            String email,
            User.Role role
    ) {
    }


    // ========================================
    // LOGIN REQUEST
    // ========================================

    public record LoginRequest(
            String email,
            String password
    ) {
    }


    // ========================================
    // LOGIN RESPONSE
    // ========================================

    public record LoginResponse(
            Long id,
            String name,
            String email,
            User.Role role
    ) {
    }

}