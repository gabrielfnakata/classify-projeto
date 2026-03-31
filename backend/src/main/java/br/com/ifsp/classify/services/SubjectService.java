package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.repositories.SubjectRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

@Service
public class SubjectService extends AbstractService<Subject, SubjectCreateDTO, SubjectGetDTO, SubjectUpdateDTO, Integer> {

    public SubjectService(SubjectRepository repository) {
        super(repository);
    }

    @Override
    SubjectGetDTO returnDTO(Subject subject) {
        if (subject == null)
            return null;

        return new SubjectGetDTO(
                UuidUtils.convertBytesToString(subject.getUuid()),
                subject.getDescription()
        );
    }

    @Override
    public SubjectGetDTO create(SubjectCreateDTO subjectDTO) {
        if (subjectDTO == null)
            return null;

        if (Utils.isNullOrEmpty(subjectDTO.description()))
            throw new DtoException("A descrição da matéria não pode ser nula");

        Subject newSubject = new Subject();
        newSubject.setUuid(UuidUtils.generateUUID());
        newSubject.setDescription(subjectDTO.description().trim().toUpperCase());

        repository.save(newSubject);

        return returnDTO(newSubject);
    }

    @Override
    public SubjectGetDTO update(String uuid, SubjectUpdateDTO subjectDTO) {
        Subject subject = getEntityById(uuid);
        if (subjectDTO == null || subject == null)
            return null;

        if (!Utils.isNullOrEmpty(subjectDTO.description()))
            subject.setDescription(subjectDTO.description().trim().toUpperCase());

        repository.save(subject);

        return returnDTO(subject);
    }
}