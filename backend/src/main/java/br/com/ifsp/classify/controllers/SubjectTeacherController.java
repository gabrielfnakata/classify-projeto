package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectTeacherGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectTeacherUpdateDTO;
import br.com.ifsp.classify.services.InterfaceService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/subjectteacher", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class SubjectTeacherController extends AbstractController<SubjectTeacherCreateDTO, SubjectTeacherGetDTO, SubjectTeacherUpdateDTO> {

    public SubjectTeacherController(InterfaceService<SubjectTeacherCreateDTO, SubjectTeacherGetDTO, SubjectTeacherUpdateDTO> service) {
        super(service);
    }
}