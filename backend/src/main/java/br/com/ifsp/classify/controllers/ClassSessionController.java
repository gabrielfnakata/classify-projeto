package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.services.ClassSessionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/classsession", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class ClassSessionController extends AbstractController<ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO> {

    private final ClassSessionService classSessionService;

    public ClassSessionController(ClassSessionService service) {
        super(service);
        this.classSessionService = service;
    }

    @GetMapping(value = "/date/{date}")
    public ResponseEntity<List<ClassSessionGetDTO>> getSessionsByDateAndLoggedProfessor(
            @PathVariable String date,
            @AuthenticationPrincipal UserDetails loggedUser
    ) {
        String professorCpf = loggedUser.getUsername();

        List<ClassSessionGetDTO> sessions =
                classSessionService.findSessionsByDateAndProfessorCpf(date, professorCpf);

        return ResponseEntity.ok(sessions);
    }
}