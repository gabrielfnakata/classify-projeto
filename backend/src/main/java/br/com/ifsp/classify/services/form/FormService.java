package br.com.ifsp.classify.services.form;

import br.com.ifsp.classify.dtos.create.FormCreateDTO;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.models.form.Form;
import br.com.ifsp.classify.repositories.form.FormAnswerRepository;
import br.com.ifsp.classify.repositories.form.FormRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FormService {
    public FormRepository formRepository;

    public FormService(FormRepository formRepository) {
        this.formRepository = formRepository;
    }


}
