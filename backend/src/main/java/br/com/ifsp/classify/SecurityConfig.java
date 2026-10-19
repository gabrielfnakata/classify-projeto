package br.com.ifsp.classify;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.com.ifsp.classify.security.JwtAuthFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${security.cors.allowed-origins}")
    private String allowedOriginsProperty;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        String ESTUDANTE = "ESTUDANTE";
        String PROFESSOR = "PROFESSOR";
        String ADMIN = "ADMIN";

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/refresh", "/auth/first-access",
                                "/auth/forgot-password", "/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user/**").hasAnyRole(ESTUDANTE, PROFESSOR, ADMIN)
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/student/me", "/student/me/**").hasRole(ESTUDANTE)
                        .requestMatchers(HttpMethod.POST, "/student/me/messages", "/student/me/schedule-requests").hasRole(ESTUDANTE)
                        .requestMatchers("/classsession/requests/**").hasAnyRole(ADMIN, PROFESSOR)
                        .requestMatchers(HttpMethod.GET, "/student/**").hasAnyRole(ADMIN, PROFESSOR)
                        .requestMatchers("/student/**").hasRole(ADMIN)
                        // O que cada um pode fazer com as aulas (só as próprias, para professor e aluno)
                        // é decidido no ClassSessionService; aqui só se libera o acesso ao recurso.
                        .requestMatchers("/classsession/**").hasAnyRole(ADMIN, PROFESSOR, ESTUDANTE)
                        .requestMatchers("/class/**", "/attendance/**").hasAnyRole(ADMIN, PROFESSOR)
                        .requestMatchers(HttpMethod.GET, "/subjectteacher/**", "/classroom/**").hasAnyRole(ADMIN, PROFESSOR, ESTUDANTE)
                        .requestMatchers(HttpMethod.GET, "/subject/**").hasAnyRole(ADMIN, PROFESSOR)
                        .requestMatchers("/employee/me", "/employee/me/**").hasAnyRole(ADMIN, PROFESSOR)
                        .requestMatchers(HttpMethod.GET, "/employee/*/availability").hasAnyRole(ADMIN, PROFESSOR, ESTUDANTE)
                        .requestMatchers("/form/**").hasAnyRole(ADMIN, PROFESSOR, ESTUDANTE)
                        .anyRequest().hasRole(ADMIN)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = (allowedOriginsProperty == null || allowedOriginsProperty.isBlank())
                ? List.of()
                : Arrays.stream(allowedOriginsProperty.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();

        if (origins.isEmpty()) {
            config.addAllowedOriginPattern("*");
        } else {
            for (String o : origins) config.addAllowedOrigin(o);
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}