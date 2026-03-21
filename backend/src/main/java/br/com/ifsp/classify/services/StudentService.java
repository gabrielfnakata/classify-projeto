package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.get.GuardianGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Guardian;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService extends AbstractService<Student, StudentCreateDTO, StudentGetDTO, StudentUpdateDTO, Long> {

    public StudentService(StudentRepository repository) {
        super(repository);
    }

    @Override
    StudentGetDTO returnDTO(Student student) {
        if (student == null)
            return null;

        return new StudentGetDTO(
                UuidUtils.convertBytesToString(student.getUuid()),
                student.getName(),
                student.getBirthDate(),
                student.getRegistrationDate(),
                student.getEmail(),
                student.getTelephone(),
                student.getAddress(),
                student.getGuardians()
                        .stream()
                        .map(guardian -> new GuardianGetDTO(guardian.getName(), guardian.getTelephone()))
                        .collect(Collectors.toList())
        );
    }

    @Override
    public StudentGetDTO create(StudentCreateDTO studentDTO) {
        if (studentDTO == null)
            return null;

        if (Utils.isNullOrEmpty(studentDTO.name()))
            throw new DtoException("O nome do aluno não pode ser nulo ou vazio");

        if (studentDTO.birthDate() == null)
            throw new DtoException("A data de nascimento do aluno não pode ser nula");

        if (studentDTO.registrationDate() == null)
            throw new DtoException("A data de matrícula do aluno não pode ser nula");

        if (Utils.isNullOrEmpty(studentDTO.email()))
            throw new DtoException("O email do aluno não pode ser nulo");

        if (Utils.isNullOrEmpty(studentDTO.telephone()))
            throw new DtoException("O telefone do aluno não pode ser nulo");

        if (Utils.isNullOrEmpty(studentDTO.address()))
            throw new DtoException("O endereço do aluno não pode ser nulo");

        Student newStudent = new Student();
        newStudent.setUuid(UuidUtils.generateUUID());
        newStudent.setName(studentDTO.name().trim().toUpperCase());
        newStudent.setBirthDate(studentDTO.birthDate());
        newStudent.setRegistrationDate(studentDTO.registrationDate());
        newStudent.setEmail(studentDTO.email().trim().toUpperCase());
        newStudent.setTelephone(studentDTO.telephone().trim());
        newStudent.setAddress(studentDTO.address().trim());

        if (Utils.hasElements(studentDTO.guardians())) {
            for (GuardianCreateDTO guardian : studentDTO.guardians()) {
                if (Utils.isNullOrEmpty(guardian.name()))
                    throw new DtoException("O nome do responsável não pode ser nulo ou vazio");

                if (Utils.isNullOrEmpty(guardian.telephone()))
                    throw new DtoException("O telefone do responsável não pode ser nulo");

                Guardian newGuardian = new Guardian();
                newGuardian.setName(guardian.name());
                newGuardian.setTelephone(guardian.telephone());

                newStudent.addGuardian(newGuardian);
            }
        }

        repository.save(newStudent);

        return returnDTO(newStudent);
    }

    @Override
    public StudentGetDTO update(String uuid, StudentUpdateDTO studentDTO) {
        Student student = getEntityById(uuid);
        if (studentDTO == null || student == null)
            return null;

        if (!Utils.isNullOrEmpty(studentDTO.name()))
            student.setName(studentDTO.name().trim().toUpperCase());

        if (studentDTO.birthDate() != null)
            student.setBirthDate(studentDTO.birthDate());

        if (studentDTO.registrationDate() != null)
            student.setRegistrationDate(studentDTO.registrationDate());

        if (!Utils.isNullOrEmpty(studentDTO.email()))
            student.setEmail(studentDTO.email().trim().toUpperCase());

        if (!Utils.isNullOrEmpty(studentDTO.telephone()))
            student.setTelephone(studentDTO.telephone().trim());

        if (!Utils.isNullOrEmpty(studentDTO.address()))
            student.setAddress(studentDTO.address().trim());

        repository.save(student);

        return returnDTO(student);
    }
}