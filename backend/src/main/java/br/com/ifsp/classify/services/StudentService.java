package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.AlunoDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class AlunoService extends BaseService<Student, AlunoDTO, Long> {

    public AlunoService(JpaRepository<Student, Long> repository) {
        super(repository);
    }

    @Override
    AlunoDTO returnDTO(Student aluno) {
        if (aluno == null)
            return null;

        return new AlunoDTO(
                aluno.getId(),
                aluno.getName(),
                aluno.getBirthDate(),
                aluno.getRegistrationDate(),
                aluno.getEmail(),
                aluno.getTelephone(),
                aluno.getAddress(),
                aluno.getNomeResponsavel(),
                aluno.getTelefoneResponsavel()
        );
    }

    @Override
    public AlunoDTO create(AlunoDTO alunoDTO) {
        if (alunoDTO == null)
            return null;

        if (Utils.isNullOrEmpty(alunoDTO.nome()))
            throw new DtoException("O nome do aluno não pode ser nulo ou vazio");

        if (alunoDTO.dataNascimento() == null)
            throw new DtoException("A data de nascimento do aluno não pode ser nula");

        if (alunoDTO.dataMatricula() == null)
            throw new DtoException("A data de matrícula do aluno não pode ser nula");

        if (Utils.isNullOrEmpty(alunoDTO.email()))
            throw new DtoException("O email do aluno não pode ser nulo");

        if (Utils.isNullOrEmpty(alunoDTO.telefone()))
            throw new DtoException("O telefone do aluno não pode ser nulo");

        if (Utils.isNullOrEmpty(alunoDTO.endereco()))
            throw new DtoException("O endereço do aluno não pode ser nulo");

        Student novoAluno = new Student();
        novoAluno.setName(alunoDTO.nome());
        novoAluno.setBirthDate(alunoDTO.dataNascimento());
        novoAluno.setRegistrationDate(alunoDTO.dataMatricula());
        novoAluno.setEmail(alunoDTO.email());
        novoAluno.setTelephone(alunoDTO.telefone());
        novoAluno.setAddress(alunoDTO.endereco());
        novoAluno.setNomeResponsavel(alunoDTO.nomeResponsavel());
        novoAluno.setTelefoneResponsavel(alunoDTO.telefoneResponsavel());

        repository.save(novoAluno);
        return returnDTO(novoAluno);
    }

    @Override
    public AlunoDTO update(Long id, AlunoDTO alunoDTO) {
        if (alunoDTO == null)
            return null;

        Student aluno = getEntityById(id);
        if (aluno == null)
            return null;

        if (!Utils.isNullOrEmpty(alunoDTO.nome()))
            aluno.setName(aluno.getName());

        if (alunoDTO.dataNascimento() != null)
            aluno.setBirthDate(alunoDTO.dataNascimento());

        if (alunoDTO.dataMatricula() != null)
            aluno.setRegistrationDate(alunoDTO.dataMatricula());

        if (!Utils.isNullOrEmpty(alunoDTO.email()))
            aluno.setEmail(aluno.getEmail());

        if (!Utils.isNullOrEmpty(alunoDTO.telefone()))
            aluno.setTelephone(aluno.getTelephone());

        if (!Utils.isNullOrEmpty(alunoDTO.endereco()))
            aluno.setAddress(aluno.getAddress());

        Student novoAluno = new Student();
        novoAluno.setName(alunoDTO.nome());
        novoAluno.setBirthDate(alunoDTO.dataNascimento());
        novoAluno.setRegistrationDate(alunoDTO.dataMatricula());
        novoAluno.setEmail(alunoDTO.email());
        novoAluno.setTelephone(alunoDTO.telefone());
        novoAluno.setAddress(alunoDTO.endereco());

        repository.save(novoAluno);
        return returnDTO(novoAluno);
    }
}