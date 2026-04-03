package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.get.SubjectTeacherEmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.SubjectTeacherGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectTeacherUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.repositories.AbstractRepository;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.SubjectRepository;
import br.com.ifsp.classify.specifications.EmployeeSpecification;
import br.com.ifsp.classify.specifications.SubjectSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

@Service
public class SubjectTeacherService extends AbstractService<SubjectTeacher, SubjectTeacherCreateDTO, SubjectTeacherGetDTO, SubjectTeacherUpdateDTO, Long> {

    private final EmployeeRepository employeeRepository;
    private final SubjectRepository subjectRepository;

    public SubjectTeacherService(AbstractRepository<SubjectTeacher, Long> repository, EmployeeRepository employeeRepository, SubjectRepository subjectRepository) {
        super(repository);
        this.employeeRepository = employeeRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    SubjectTeacherGetDTO returnDTO(SubjectTeacher subjectTeacher) {
        if (subjectTeacher == null)
            return null;

        return new SubjectTeacherGetDTO(
                UuidUtils.convertBytesToString(subjectTeacher.getUuid()),
                new SubjectTeacherEmployeeGetDTO(
                        UuidUtils.convertBytesToString(subjectTeacher.getEmployee().getUuid()),
                        subjectTeacher.getEmployee().getName()
                ),
                new SubjectGetDTO(
                        UuidUtils.convertBytesToString(subjectTeacher.getSubject().getUuid()),
                        subjectTeacher.getSubject().getDescription()
                )
        );
    }

    @Override
    public SubjectTeacherGetDTO create(SubjectTeacherCreateDTO subjectTeacherDTO) {
        if (subjectTeacherDTO == null)
            return null;

        if (Utils.isNullOrEmpty(subjectTeacherDTO.employeeId()))
            throw new DtoException("É necessário informar um funcionário");

        if (Utils.isNullOrEmpty(subjectTeacherDTO.subjectId()))
            throw new DtoException("É necessário informar uma disciplina");

        Employee employee = employeeRepository
                .findOne(EmployeeSpecification.getByUUID(subjectTeacherDTO.employeeId()))
                .orElse(null);

        if (employee == null)
            throw new DtoException("O funcionário informado não existe");

        Subject subject = subjectRepository
                .findOne(SubjectSpecification.getByUUID(subjectTeacherDTO.subjectId()))
                .orElse(null);

        if (subject == null)
            throw new DtoException("A matéria informada não existe");

        SubjectTeacher newSubjectTeacher = new SubjectTeacher();
        newSubjectTeacher.setUuid(UuidUtils.generateUUID());
        newSubjectTeacher.setEmployee(employee);
        newSubjectTeacher.setSubject(subject);

        repository.save(newSubjectTeacher);

        return returnDTO(newSubjectTeacher);
    }

    @Override
    public SubjectTeacherGetDTO update(String uuid, SubjectTeacherUpdateDTO subjectTeacherDTO) {
        SubjectTeacher subjectTeacher = getEntityById(uuid);
        if (subjectTeacher == null || subjectTeacherDTO == null)
            return null;

        if (Utils.isNullOrEmpty(subjectTeacherDTO.employeeId()) && Utils.isNullOrEmpty(subjectTeacherDTO.subjectId()))
            throw new DtoException("Nenhum parâmetro foi passado");

        if (!Utils.isNullOrEmpty(subjectTeacherDTO.employeeId())) {
            Employee employee = employeeRepository
                    .findOne(EmployeeSpecification.getByUUID(subjectTeacherDTO.employeeId()))
                    .orElse(null);

            if (employee == null)
                throw new DtoException("O funcionário informado não existe");

            subjectTeacher.setEmployee(employee);
        }

        if (!Utils.isNullOrEmpty(subjectTeacherDTO.subjectId())) {
            Subject subject = subjectRepository
                    .findOne(SubjectSpecification.getByUUID(subjectTeacherDTO.subjectId()))
                    .orElse(null);

            if (subject == null)
                throw new DtoException("A matéria informada não existe");

            subjectTeacher.setSubject(subject);
        }

        repository.save(subjectTeacher);

        return returnDTO(subjectTeacher);
    }
}