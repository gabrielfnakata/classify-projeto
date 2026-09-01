package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.FormCreateDTO;
import br.com.ifsp.classify.dtos.create.FormQuestionCreateDTO;
import br.com.ifsp.classify.dtos.create.FormSubmissionCreateDTO;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.dtos.get.FormInfoGetDTO;
import br.com.ifsp.classify.dtos.update.FormAnswerCorrectionDTO;
import br.com.ifsp.classify.dtos.update.FormCorrectionScoreUpdateDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.form.FormService;
import br.com.ifsp.classify.services.form.FormSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/form", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class FormController {

    public FormService formService;
    public FormSubmissionService formSubmissionService;

    public FormController(FormService formService, FormSubmissionService formSubmissionService) {
        this.formService = formService;
        this.formSubmissionService = formSubmissionService;
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
    public FormInfoGetDTO getFormInfo(@PathVariable String uuid) {
        return this.formService.getFormInfo(uuid);
    }

    @PutMapping("/submission-start/{uuid}")
    public void markFormSubmissionStart(@PathVariable String uuid) {
        this.formSubmissionService.markSubmissionStart(uuid);
    }

    @PutMapping("/submit-form/{uuid}")
    public void markFormSubmission(@PathVariable String uuid, @RequestBody FormSubmissionCreateDTO dto) {
        this.formSubmissionService.saveFormSubmission(uuid, dto);
    }

    @PutMapping("/correct-form-question")
    public void correctFormQuestion(@Valid @RequestBody FormAnswerCorrectionDTO dto) {
        this.formSubmissionService.correctFormAnswer(dto);
    }

    @PutMapping("/give-score")
    public void giveFormScore(@Valid @RequestBody FormCorrectionScoreUpdateDTO dto) {
        this.formSubmissionService.finishCorrection(dto);
    }

    /* TODO:
     - Endpoint pra enviar formulário para alunos
     - Suporte à filtros e paginação (aguardar merge)
     - Endpoint pra professor corrigir formulário
     */
}
