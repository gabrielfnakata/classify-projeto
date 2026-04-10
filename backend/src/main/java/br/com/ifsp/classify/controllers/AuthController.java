package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.auth.LoginRequestDTO;
import br.com.ifsp.classify.dtos.auth.LoginResponseDTO;
import br.com.ifsp.classify.dtos.auth.RefreshRequestDTO;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.security.JwtService;
import br.com.ifsp.classify.specifications.EmployeeSpecification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder    = passwordEncoder;
        this.jwtService         = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO body ) {
        Employee employee = employeeRepository.findOne(EmployeeSpecification.getByCpf(body.cpf())).orElse(null);
        if (employee == null || !passwordEncoder.matches(body.password(), employee.getPassword()))
            return ResponseEntity.status(401).build();

        String role = employee.getRole().getDescription();
        String accessToken = jwtService.generateAccessToken(employee.getCpf(), role);
        String refreshToken = jwtService.generateRefreshToken(employee.getCpf());

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@RequestBody RefreshRequestDTO body ) {
        if (!jwtService.isRefreshTokenValid(body.refreshToken()))
            return ResponseEntity.status(401).build();

        String cpf = jwtService.extractCpf(body.refreshToken());
        Employee employee = employeeRepository.findOne(EmployeeSpecification.getByCpf(cpf)).orElse(null);
        if (employee == null)
            return ResponseEntity.status(401).build();

        String role = employee.getRole().getDescription();
        String accessToken = jwtService.generateAccessToken(cpf, role);

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, body.refreshToken()));
    }
}