package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.AlunoDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Aluno;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class AlunoService extends BaseService<Aluno, AlunoDTO, Long> {

    public AlunoService(JpaRepository<Aluno, Long> repository) {
        super(repository);
    }

    @Override
    AlunoDTO returnDTO(Aluno aluno) {
        if (aluno == null)
            return null;

        return new AlunoDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getDataNascimento(),
                aluno.getDataMatricula(),
                aluno.getEmail(),
                aluno.getTelefone(),
                aluno.getEndereco(),
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

        Aluno novoAluno = new Aluno();
        novoAluno.setNome(alunoDTO.nome());
        novoAluno.setDataNascimento(alunoDTO.dataNascimento());
        novoAluno.setDataMatricula(alunoDTO.dataMatricula());
        novoAluno.setEmail(alunoDTO.email());
        novoAluno.setTelefone(alunoDTO.telefone());
        novoAluno.setEndereco(alunoDTO.endereco());
        novoAluno.setNomeResponsavel(alunoDTO.nomeResponsavel());
        novoAluno.setTelefoneResponsavel(alunoDTO.telefoneResponsavel());

        repository.save(novoAluno);
        return returnDTO(novoAluno);
    }

    @Override
    public AlunoDTO update(Long id, AlunoDTO alunoDTO) {
        if (alunoDTO == null)
            return null;

        Aluno aluno = getEntityById(id);
        if (aluno == null)
            return null;

        if (!Utils.isNullOrEmpty(alunoDTO.nome()))
            aluno.setNome(aluno.getNome());

        if (alunoDTO.dataNascimento() != null)
            aluno.setDataNascimento(alunoDTO.dataNascimento());

        if (alunoDTO.dataMatricula() != null)
            aluno.setDataMatricula(alunoDTO.dataMatricula());

        if (!Utils.isNullOrEmpty(alunoDTO.email()))
            aluno.setEmail(aluno.getEmail());

        if (!Utils.isNullOrEmpty(alunoDTO.telefone()))
            aluno.setTelefone(aluno.getTelefone());

        if (!Utils.isNullOrEmpty(alunoDTO.endereco()))
            aluno.setEndereco(aluno.getEndereco());

        Aluno novoAluno = new Aluno();
        novoAluno.setNome(alunoDTO.nome());
        novoAluno.setDataNascimento(alunoDTO.dataNascimento());
        novoAluno.setDataMatricula(alunoDTO.dataMatricula());
        novoAluno.setEmail(alunoDTO.email());
        novoAluno.setTelefone(alunoDTO.telefone());
        novoAluno.setEndereco(alunoDTO.endereco());

        repository.save(novoAluno);
        return returnDTO(novoAluno);
    }
}