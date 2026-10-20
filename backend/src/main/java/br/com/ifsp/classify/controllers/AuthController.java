package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.ExceptionDTO;
import br.com.ifsp.classify.dtos.auth.FirstAccessRequestDTO;
import br.com.ifsp.classify.dtos.auth.ForgotPasswordRequestDTO;
import br.com.ifsp.classify.dtos.auth.ResetPasswordRequestDTO;
import br.com.ifsp.classify.services.PasswordResetService;
import br.com.ifsp.classify.dtos.auth.LoginRequestDTO;
import br.com.ifsp.classify.dtos.auth.LoginResponseDTO;
import br.com.ifsp.classify.dtos.auth.RefreshRequestDTO;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.JwtService;
import br.com.ifsp.classify.security.UserRole;
import br.com.ifsp.classify.services.UserService;
import br.com.ifsp.classify.specifications.UserSpecification;

import org.springframework.http.HttpStatus;
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
    private final UserService userService;
    private final PasswordResetService passwordResetService;

    public AuthController(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtService jwtService,
            UserService userService, PasswordResetService passwordResetService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO body ) {
        User user = userRepository
            .findOne(UserSpecification.getByEmail(body.email()))
            .orElse(null);

        if (user != null && !user.hasPassword()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "Você ainda não criou sua senha. Clique em \"Primeiro acesso\" para criá-la."));
        }

        if (user == null || !passwordEncoder.matches(body.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "E-mail ou senha inválidos."));
        }

        String role = user.getRole().getId();
        if (UserRole.fromId(role).isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "Seu perfil não está habilitado. Solicite a atualização do acesso ao administrador."));
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), role);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, refreshToken));
    }

    @PostMapping("/first-access")
    public ResponseEntity<LoginResponseDTO> firstAccess(@RequestBody FirstAccessRequestDTO body) {
        User user = userService.defineFirstAccessPassword(body.email(), body.password(), body.confirmPassword());
        return ResponseEntity.ok(issueTokens(user));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequestDTO body) {
        passwordResetService.requestReset(body.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<LoginResponseDTO> resetPassword(@RequestBody ResetPasswordRequestDTO body) {
        User user = passwordResetService.resetPassword(body.token(), body.password(), body.confirmPassword());
        return ResponseEntity.ok(issueTokens(user));
    }

    private LoginResponseDTO issueTokens(User user) {
        return new LoginResponseDTO(
                jwtService.generateAccessToken(user.getEmail(), user.getRole().getId()),
                jwtService.generateRefreshToken(user.getEmail()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequestDTO body ) {
        if (!jwtService.isRefreshTokenValid(body.refreshToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "Sua sessão expirou. Faça login novamente."));
        }

        String email = jwtService.extractEmail(body.refreshToken());
        User user = userRepository
            .findOne(UserSpecification.getByEmail(email))
            .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "Sua sessão expirou. Faça login novamente."));
        }

        String role = user.getRole().getId();
        if (UserRole.fromId(role).isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ExceptionDTO(
                            HttpStatus.UNAUTHORIZED.value(),
                            ExceptionCode.INVALID_CREDENTIALS.getCode(),
                            "Seu perfil não está habilitado. Solicite a atualização do acesso ao administrador."));
        }

        String accessToken = jwtService.generateAccessToken(email, role);

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, body.refreshToken()));
    }
}
