package secureassess.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // ========================================
                // DISABLE CSRF
                // ========================================

                .csrf(csrf -> csrf.disable())


                // ========================================
                // AUTHORIZE REQUESTS
                // ========================================

                .authorizeHttpRequests(auth -> auth

                        // Authentication APIs
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // All other APIs
                        // temporarily open for frontend testing
                        .anyRequest().permitAll()
                );


        return http.build();
    }
}