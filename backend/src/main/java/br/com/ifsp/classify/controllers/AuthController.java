package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.auth.LoginRequestDTO;
import br.com.ifsp.classify.dtos.auth.LoginResponseDTO;
import br.com.ifsp.classify.dtos.auth.RefreshRequestDTO;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.JwtService;
import br.com.ifsp.classify.specifications.UserSpecification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtService jwtService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO body ) {
        User user = userRepository
            .findOne(UserSpecification.getByEmail(body.email()))
            .orElse(null);

        if (user == null || !passwordEncoder.matches(body.password(), user.getPassword()))
            return ResponseEntity.status(401).build();

        String role = user.getRole().getDescription();
        String accessToken = jwtService.generateAccessToken(user.getEmail(), role);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@RequestBody RefreshRequestDTO body ) {
        if (!jwtService.isRefreshTokenValid(body.refreshToken()))
            return ResponseEntity.status(401).build();

        String email = jwtService.extractEmail(body.refreshToken());
        User user = userRepository
            .findOne(UserSpecification.getByEmail(email))
            .orElse(null);

        if (user == null)
            return ResponseEntity.status(401).build();

        String role = user.getRole().getDescription();
        String accessToken = jwtService.generateAccessToken(email, role);

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, body.refreshToken()));
    }
}