package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.FormCreateDTO;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.dtos.get.FormQuestionGetDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.form.FormService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/form", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class FormController {

    public FormService formService;

    public FormController(FormService formService) {
        this.formService = formService;
    }

    @PostMapping
    public FormGetDTO createForm(@Valid @RequestBody FormCreateDTO form, @AuthenticationPrincipal AuthenticatedUser auth) {
        return this.formService.create(form, auth.username());
    }

    @GetMapping
    public List<FormGetDTO> getMyForms(@AuthenticationPrincipal AuthenticatedUser auth) {
        return this.formService.getForms(auth);
    }

    @GetMapping("/{uuid}")
    public List<FormQuestionGetDTO> getFormQuestions(@AuthenticationPrincipal AuthenticatedUser auth, @PathVariable String uuid) {
        return this.formService.getFormQuestions(uuid);
    }

    /* TODO:
     - Endpoint pra criar formulário OK
        - haverá suporte a rascunho?
     - Endpoint pra enviar formulário para alunos
     - Endpoint pra listar formulários de um professor para ele mesmo (OK) ou de um professor para seus alunos
        - Suporte à filtros e paginação
     - Endpoint pra trazer as questões (junto de respostas, se já houverem, no caso de um aluno) de um formulário
     - Endpoint pra demarcar o início de uma tentativa de formulário
        - haverá suporte a rascunho?
     - Endpoint pra enviar uma tentativa do formulário
     - Endpoint pra professor corrigir formulário
     */
}
