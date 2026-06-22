package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.AddressGetDTO;
import br.com.ifsp.classify.dtos.get.GuardianGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.get.TelephoneGetDTO;
import br.com.ifsp.classify.dtos.update.GuardianUpdateDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Address;
import br.com.ifsp.classify.models.Guardian;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService extends AbstractService<Student, StudentCreateDTO, StudentGetDTO, StudentUpdateDTO, Long> {

    private final TelephoneService telephoneService;
    private final AddressService addressService;

    public StudentService(StudentRepository repository, TelephoneService telephoneService, AddressService addressService) {
        super(repository);
        this.telephoneService = telephoneService;
        this.addressService = addressService;
    }

    @Override
    StudentGetDTO returnDTO(Student student) {
        if (student == null)
            return null;

        return new StudentGetDTO(
            UuidUtils.convertBytesToString(student.getUuid()),
            student.getName(),
            student.getBirthDate(),
            student.getEmail(),
            student.getCpf(),
            student.getRegistrationDate(),
            returnDTO(student.getGuardians()),
            student.getTelephones()
                .stream()
                .map(telephone -> telephoneService.returnDTO(telephone))
                .toList()
        );
    }

    private List<GuardianGetDTO> returnDTO(List<Guardian> guardians) {
        if (guardians == null || guardians.isEmpty())
            return null;

        return guardians
            .stream()
            .map(guardian -> returnDTO(guardian))
            .toList();
    }

    private GuardianGetDTO returnDTO(Guardian guardian) {
        if (guardian == null)
            return null;

        return new GuardianGetDTO(
                UuidUtils.convertBytesToString(guardian.getUuid()),
                guardian.getName(),
                guardian.getCpf(),
                guardian.getEmail(),
                addressService.returnDTO(guardian.getAddress())
        );
    }

    @Override
    public StudentGetDTO create(StudentCreateDTO studentDTO) {
        if (studentDTO == null)
            return null;

        if (Utils.isNullOrEmpty(studentDTO.name()))
            throw new DtoException("O nome do aluno não pode ser nulo ou vazio");

        if (!Utils.isNullOrEmpty(studentDTO.cpf()) && !Utils.cpfValidator(studentDTO.cpf()))
            throw new DtoException("O CPF informado é inválido");

        if (studentDTO.registrationDate() == null)
            throw new DtoException("A data de matrícula do aluno não pode ser nula");

        Student newStudent = new Student();
        newStudent.setUuid(UuidUtils.generateUUID());
        newStudent.setName(Utils.trimAndUpper(studentDTO.name()));
        newStudent.setBirthDate(studentDTO.birthDate());
        newStudent.setEmail(Utils.trimAndUpper(studentDTO.email()));
        newStudent.setCpf(Utils.removeAllNonDigits(studentDTO.cpf()));
        newStudent.setRegistrationDate(studentDTO.registrationDate());

        if (Utils.hasElements(studentDTO.guardians())) {
            for (GuardianCreateDTO guardian : studentDTO.guardians()) {
                Guardian newGuardian = create(guardian);

                if (newGuardian != null)
                    newStudent.addGuardian(newGuardian);
            }
        }

        if (Utils.hasElements(studentDTO.telephones())) {
            for (TelephoneCreateDTO telephone : studentDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);
                
                if (newTelephone != null) {
                    newStudent.addTelephone(newTelephone);
                }
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
            student.setName(Utils.trimAndUpper(studentDTO.name()));

        if (studentDTO.birthDate() != null)
            student.setBirthDate(studentDTO.birthDate());

        if (!Utils.isNullOrEmpty(studentDTO.email()))
            student.setEmail(Utils.trimAndUpper(studentDTO.email().trim()));

        if (!Utils.isNullOrEmpty(studentDTO.cpf()) && Utils.cpfValidator(studentDTO.cpf()))
            student.setCpf(Utils.removeAllNonDigits(studentDTO.cpf()));
        
        if (studentDTO.registrationDate() != null)
            student.setRegistrationDate(studentDTO.registrationDate());

        // TODO: Fazer a validação de telephones já existentes
        // if (Utils.hasElements(studentDTO.telephones())) {
            
        // }

        repository.save(student);

        return returnDTO(student);
    }

    public List<GuardianGetDTO> addGuardians(String studentUuid, List<GuardianCreateDTO> guardiansDTO) {
        if (!Utils.hasElements(guardiansDTO))
            return null;

        Student student = getEntityById(studentUuid);
        if (student == null)
            throw new DtoException("O aluno informado não existe");

        for (GuardianCreateDTO guardian : guardiansDTO) {
            Guardian newGuardian = create(guardian);

            if (newGuardian != null)
                student.addGuardian(newGuardian);
        }

        repository.save(student);

        return returnDTO(student.getGuardians());
    }

    public GuardianGetDTO updateGuardian(String uuid, String guardianUuid, GuardianUpdateDTO guardianDTO) {
        // Student student = getEntityById(uuid);
        // if (student == null || guardianDTO == null)
        //     return null;

        // if (Utils.isNullOrEmpty(guardianDTO.name()) && Utils.isNullOrEmpty(guardianDTO.telephone()))
        //     throw new DtoException("Nenhum campo foi informado para alteração");

        // Guardian guardianToBeReturned = new Guardian();
        // student.getGuardians()
        //         .stream()
        //         .filter(guardian -> UuidUtils.convertBytesToString(guardian.getUuid()).equals(guardianUuid.trim()))
        //         .findFirst()
        //         .ifPresentOrElse((guardian) -> {
        //             if (!Utils.isNullOrEmpty(guardianDTO.name()))
        //                 guardian.setName(guardianDTO.name().trim().toUpperCase());

        //             if (!Utils.isNullOrEmpty(guardianDTO.telephone()))
        //                 guardian.setTelephone(guardianDTO.telephone().trim());

        //             guardianToBeReturned.setUuid(guardian.getUuid());
        //             guardianToBeReturned.setName(guardian.getName());
        //             guardianToBeReturned.setTelephone(guardian.getTelephone());
        //         }, () -> {
        //             throw new DtoException("O responsável informado não existe");
        //         });

        // repository.save(student);

        // return returnDTO(guardianToBeReturned);
        return null;
    }

    private Guardian create(GuardianCreateDTO guardianDTO) {
        if (guardianDTO == null)
            return null;

        if (Utils.isNullOrEmpty(guardianDTO.name()))
            throw new DtoException("O nome do responsável não pode ser nulo ou vazio");

        if (!Utils.isNullOrEmpty(guardianDTO.cpf()) && !Utils.cpfValidator(guardianDTO.cpf()))
            throw new DtoException("O CPF informado é inválido");

        if (Utils.isNullOrEmpty(guardianDTO.email()))
            throw new DtoException("O email do responsável não pode ser nulo");

        Guardian newGuardian = new Guardian();
        newGuardian.setUuid(UuidUtils.generateUUID());
        newGuardian.setName(Utils.trimAndUpper(guardianDTO.name()));
        newGuardian.setCpf(Utils.removeAllNonDigits(guardianDTO.cpf()));
        newGuardian.setEmail(Utils.trimAndUpper(guardianDTO.email()));
        
        Address newAddress = (guardianDTO.address() != null)
            ? addressService.create(guardianDTO.address())
            : null;
        newGuardian.setAddress(newAddress);

        if (Utils.hasElements(guardianDTO.telephones())) {
            for (TelephoneCreateDTO telephone : guardianDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);

                if (newTelephone != null) {
                    newGuardian.addTelephone(newTelephone);
                }
            }
        }

        return newGuardian;
    }
}