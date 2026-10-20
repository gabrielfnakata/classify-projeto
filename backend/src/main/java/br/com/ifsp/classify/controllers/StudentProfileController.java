package br.com.ifsp.classify.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.StudentProfileService;

@RestController
@RequestMapping(value = "/student/me/telephone", produces = MediaType.APPLICATION_JSON_VALUE)
public class StudentProfileController {

    private final StudentProfileService service;

    public StudentProfileController(StudentProfileService service) {
        this.service = service;
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StudentGetDTO> updateTelephone(Authentication authentication,
                                                         @RequestBody TelephoneCreateDTO telephone) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(service.updateTelephone(user.username(), telephone));
    }
}
