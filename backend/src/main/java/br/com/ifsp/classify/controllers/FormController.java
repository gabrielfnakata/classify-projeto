package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.*;
import br.com.ifsp.classify.dtos.get.AnswerFileUploadDTO;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.dtos.get.FormInfoGetDTO;
import br.com.ifsp.classify.dtos.update.FormAnswerCorrectionDTO;
import br.com.ifsp.classify.dtos.update.FormCorrectionScoreUpdateDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.form.FormService;
import br.com.ifsp.classify.services.form.FormSubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/form", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class FormController {

    private String hookAuthToken;
    public FormService formService;
    public FormSubmissionService formSubmissionService;

    public FormController(
            FormService formService,
            FormSubmissionService formSubmissionService,
            @Value("{silo.webhook.auth.token}") String hookAuthToken
            ) {
        this.formService = formService;
        this.formSubmissionService = formSubmissionService;
        this.hookAuthToken = hookAuthToken;
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

    @PostMapping("/upload-url")
    public AnswerFileUploadDTO requestUploadUrl(@Valid @RequestBody AnswerFileCreateDTO dto) throws Exception {
        return this.formSubmissionService.generateUploadUrl(dto);
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

    @PostMapping("/finish-upload")
    public ResponseEntity<?> finishUpload(@RequestHeader("Authorization") String authorizationToken, @RequestBody ConfirmAnswerFileUploadDTO dto) {
        if (!hookAuthToken.equals(authorizationToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        this.formSubmissionService.handleUploadConfirmation(dto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/send-forms")
    public ResponseEntity<?> sendForms(@Valid @RequestBody AssignFormToStudentsDTO dto) {
        this.formService.sendFormsToStudents(dto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /* TODO:
     - Suporte à filtros e paginação (aguardar merge)
     - Endpoint pra professor corrigir formulário
     */
}
