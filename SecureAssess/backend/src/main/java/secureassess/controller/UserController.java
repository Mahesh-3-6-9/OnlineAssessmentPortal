package secureassess.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import secureassess.entity.User;
import secureassess.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // ========================================
    // REGISTER
    // POST /api/users/register
    // ========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            if (request.name() == null ||
                    request.name().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Name is required");
            }


            if (request.email() == null ||
                    request.email().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email is required");
            }


            if (request.password() == null ||
                    request.password().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Password must contain at least 6 characters"
                        );
            }


            if (request.role() == null ||
                    request.role().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Role is required");
            }


            User.Role role;

            try {

                role =
                        User.Role.valueOf(
                                request.role()
                                        .trim()
                                        .toUpperCase()
                        );

            } catch (IllegalArgumentException e) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Role must be STUDENT or TEACHER"
                        );
            }


            User user =
                    userService.registerUser(
                            request.name().trim(),
                            request.email()
                                    .trim()
                                    .toLowerCase(),
                            request.password(),
                            role
                    );


            /*
             * Do NOT return the password.
             */

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new UserResponse(
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getRole()
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }


    // ========================================
    // LOGIN
    // POST /api/users/login
    // ========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            if (request.email() == null ||
                    request.password() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Email and password are required"
                        );
            }


            User user =
                    userService.loginUser(
                            request.email()
                                    .trim()
                                    .toLowerCase(),
                            request.password()
                    );


            /*
             * Do NOT return the password.
             */

            return ResponseEntity.ok(
                    new UserResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        }

    }


    // ========================================
    // REGISTER REQUEST
    // ========================================

    public record RegisterRequest(

            String name,

            String email,

            String password,

            String role

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
    // SAFE USER RESPONSE
    // ========================================

    public record UserResponse(

            Long id,

            String name,

            String email,

            User.Role role

    ) {
    }

}