CREATE TABLE IF NOT EXISTS ALUNO (
	idAluno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nome VARCHAR(255) NOT NULL,
	dataNascimento DATE NOT NULL,
	dataMatricula DATE NOT NULL,
	email VARCHAR(255) NOT NULL,
	telefone CHAR(11) NOT NULL,
	endereco VARCHAR(255) NOT NULL,
	nomeResponsavel VARCHAR(255),
	telefoneResponsavel VARCHAR(11),

	CONSTRAINT aluno_id_pk PRIMARY KEY (idAluno),
	CONSTRAINT aluno_email_uk UNIQUE (email)
);

CREATE TABle IF NOT EXISTS CARGO (
    idCargo TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,,
    descricao VARCHAR(255) NOT NULL,

    CONSTRAINT cargo_id_pk PRIMARY KEY (idCargo),
    CONSTRAINT cargo_descricao_uk UNIQUE (descricao)
);

CREATE TABLE IF NOT EXISTS FUNCIONARIO (
	idFuncionario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	nome VARCHAR(255) NOT NULL,
	cpf CHAR(11) NOT NULL,
	dataNascimento DATE NOT NULL,
	email VARCHAR(255) NOT NULL,
	telefone CHAR(11) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
	idCargo TINYINT UNSIGNED NOT NULL,
	isAdministrador BOOLEAN NOT NULL,

	CONSTRAINT funcionario_id_pk PRIMARY KEY (idFuncionario),
	CONSTRAINT funcionario_cpf_uk UNIQUE (cpf),
	CONSTRAINT funcionario_email_uk UNIQUE (email),
	CONSTRAINT funcionario_cargo_fk FOREIGN KEY (idCargo) REFERENCES CARGO(idCargo)
);

CREATE TABLE IF NOT EXISTS DISCIPLINA (
	idDisciplina TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	descricao VARCHAR(255) NOT NULL,

	CONSTRAINT disciplina_id_pk PRIMARY KEY (idDisciplina),
	CONSTRAINT disciplina_descricao_uk UNIQUE (descricao)
);

CREATE TABLE IF NOT EXISTS PROFESSOR_DISCIPLINA (
	idProfessorDisciplina BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	idFuncionario BIGINT UNSIGNED NOT NULL,
	idDisciplina TINYINT UNSIGNED NOT NULL,

	CONSTRAINT professordisciplina_id_pk PRIMARY KEY (id),
	CONSTRAINT professordisciplina_idFunc_fk FOREIGN KEY (idFuncionario) REFERENCES FUNCIONARIO(idFuncionario),
	CONSTRAINT professordisciplina_idDisc_fk FOREIGN KEY (idDisciplina) REFERENCES DISCIPLINA(idDisciplina),
	CONSTRAINT professordisciplina_idFunc_idDisc_uk UNIQUE (idFuncionario, idDisciplina)
);

CREATE TABLE IF NOT EXISTS TIPO_PAGAMENTO (
	idTipoPagamento TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	descricao VARCHAR(255) NOT NULL,

	CONSTRAINT tipopagamento_id_pk PRIMARY KEY (id),
	CONSTRAINT tipopagamento_descricao_uk UNIQUE (descricao)
);

CREATE TABLE IF NOT EXISTS FUNCIONARIO_PAGAMENTO (
	idConta BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	idTipoPagamento TINYINT UNSIGNED NOT NULL,
	idFuncionario BIGINT UNSIGNED NOT NULL,

	CONSTRAINT funcionariopagamento_id_pk PRIMARY KEY (idConta),
	CONSTRAINT funcionariopagamento_idTipoPag_fk FOREIGN KEY (idTipoPagamento) REFERENCES TIPO_PAGAMENTO(id),
	CONSTRAINT funcionariopagamento_idFunc_fk FOREIGN KEY (idFuncionario) REFERENCES FUNCIONARIO(idFuncionario)
);

CREATE TABLE IF NOT EXISTS SALA (
	idSala TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	nome VARCHAR(255) NOT NULL,
	vagas TINYINT UNSIGNED NOT NULL,
	capacidade TINYINT UNSIGNED NOT NULL,
	estaDisponivel BOOLEAN NOT NULL DEFAULT 1,

	CONSTRAINT sala_id_pk PRIMARY KEY (idSala),
	CONSTRAINT sala_vagas_ck CHECK (vagas > 0)
);

CREATE TABLE IF NOT EXISTS AULA (
	idAula BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	idProfessorDisciplina BIGINT UNSIGNED NOT NULL,
	idSala TINYINT UNSIGNED NOT NULL,
	horarioInicio DATETIME NOT NULL,
	horarioFim DATETIME NOT NULL,

	CONSTRAINT aula_id_pk PRIMARY KEY (idAula),
	CONSTRAINT aula_idProfDisc_fk FOREIGN KEY (idProfessorDisciplina) REFERENCES PROFESSOR_DISCIPLINA(id),
	CONSTRAINT aula_idSala_fk FOREIGN KEY (idSala) REFERENCES SALA(idSala),
	CONSTRAINT aula_horarioInicioFim_ck CHECK (horarioInicio > horarioFim)
);

CREATE TABLE IF NOT EXISTS ALUNO_AULA (
	idAluno BIGINT UNSIGNED,
	idAula BIGINT UNSIGNED,

	CONSTRAINT alunoaula_idAluno_idAula_pk PRIMARY KEY (idAluno, idAula),
	CONSTRAINT alunoaula_idAluno_fk FOREIGN KEY (idAluno) REFERENCES ALUNO(idAluno),
	CONSTRAINT alunoaula_idAula_fk FOREIGN KEY (idAula) REFERENCES AULA(idAula)
);

CREATE TABLE IF NOT EXISTS DOCUMENTO (
	idDocumento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,,
	idFuncionario BIGINT UNSIGNED NOT NULL, -- pq funcionario?
	idAluno BIGINT UNSIGNED NOT NULL,
	caminhoArq VARCHAR(255) NOT NULL,

	CONSTRAINT documento_id_pk PRIMARY KEY (idDocumento),
	CONSTRAINT documento_idFunc_fk FOREIGN KEY (idFuncionario) REFERENCES FUNCIONARIO(idFuncionario),
	CONSTRAINT documento_idAluno_fk FOREIGN KEY (idAluno) REFERENCES ALUNO(idAluno)
);
