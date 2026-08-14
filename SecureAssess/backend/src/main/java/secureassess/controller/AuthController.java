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


    public record RegisterRequest(
            String name,
            String email,
            String password,
            User.Role role
    ) {
    }


    public record RegisterResponse(
            Long id,
            String name,
            String email,
            User.Role role
    ) {
    }

}