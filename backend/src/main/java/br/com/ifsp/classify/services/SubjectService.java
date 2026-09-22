package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.repositories.SubjectRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class SubjectService extends AbstractService<Subject, SubjectCreateDTO, SubjectGetDTO, SubjectUpdateDTO, Integer> {

    private final AuditService auditService;

    public SubjectService(SubjectRepository repository, AuditService auditService) {
        super(repository);
        this.auditService = auditService;
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
        SubjectGetDTO createdSubject = returnDTO(newSubject);
        auditService.logInsert("SUBJECT", Long.valueOf(newSubject.getId()), createdSubject);

        return createdSubject;
    }

    @Override
    public SubjectGetDTO update(String uuid, SubjectUpdateDTO subjectDTO) {
        Subject subject = getEntityById(uuid);
        if (subjectDTO == null || subject == null)
            return null;

        SubjectGetDTO oldSubject = returnDTO(subject);

        if (!Utils.isNullOrEmpty(subjectDTO.description()))
            subject.setDescription(subjectDTO.description().trim().toUpperCase());

        repository.save(subject);
        SubjectGetDTO updatedSubject = returnDTO(subject);
        auditService.logUpdate("SUBJECT", Long.valueOf(subject.getId()), oldSubject, updatedSubject);

        return updatedSubject;
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        Subject subject = getEntityById(uuid);
        if (subject == null)
            return ResponseEntity.badRequest().build();

        SubjectGetDTO oldSubject = returnDTO(subject);
        Long id = Long.valueOf(subject.getId());
        repository.delete(subject);
        auditService.logDelete("SUBJECT", id, oldSubject);

        return ResponseEntity.noContent().build();
    }
}