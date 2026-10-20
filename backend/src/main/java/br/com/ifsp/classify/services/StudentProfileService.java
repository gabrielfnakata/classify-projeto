package br.com.ifsp.classify.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.utils.Utils;

@Service
public class StudentProfileService {

    private final StudentService studentService;
    private final StudentRepository studentRepository;
    private final TelephoneService telephoneService;
    private final AuditService auditService;

    public StudentProfileService(StudentService studentService, StudentRepository studentRepository,
                                 TelephoneService telephoneService, AuditService auditService) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
        this.telephoneService = telephoneService;
        this.auditService = auditService;
    }

    @Transactional
    public StudentGetDTO updateTelephone(String email, TelephoneCreateDTO telephoneDTO) {
        Student student = studentService.getEntityForUser(email);
        if (student == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Aluno não encontrado.");

        if (telephoneDTO == null || Utils.isNullOrEmpty(telephoneDTO.number()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar um número de telefone.");

        StudentGetDTO oldStudent = studentService.returnDTO(student);
        Telephone validated = telephoneService.create(telephoneDTO);

        if (student.getTelephones().isEmpty()) {
            student.addTelephone(validated);
        } else {
            Telephone current = student.getTelephones().get(0);
            current.setCountry(validated.getCountry());
            current.setDdd(validated.getDdd());
            current.setNumber(validated.getNumber());
        }

        studentRepository.save(student);
        StudentGetDTO updatedStudent = studentService.returnDTO(student);
        auditService.logUpdate("STUDENT", student.getId(), oldStudent, updatedStudent);

        return updatedStudent;
    }
}
