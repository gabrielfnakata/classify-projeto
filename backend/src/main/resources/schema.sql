CREATE TABLE IF NOT EXISTS ALUNO (
	id_aluno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nome VARCHAR(255) NOT NULL,
	data_nascimento DATE NOT NULL,
	data_matricula DATE NOT NULL,
	email VARCHAR(255) NOT NULL,
	telefone CHAR(11) NOT NULL,
	endereco VARCHAR(255) NOT NULL,
	nome_responsavel VARCHAR(255),
	telefone_responsavel VARCHAR(11),
	registrado_por BIGINT UNSIGNED NOT NULL,
	data_registro DATETIME NOT NULL,
	modificado_por BIGINT UNSIGNED,
	data_modificacao DATETIME,

	CONSTRAINT aluno_id_pk PRIMARY KEY (id_aluno),
	CONSTRAINT aluno_email_uk UNIQUE (email)
);

CREATE TABlE IF NOT EXISTS CARGO (
    id_cargo TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    descricao VARCHAR(255) NOT NULL,

    CONSTRAINT cargo_id_pk PRIMARY KEY (id_cargo),
    CONSTRAINT cargo_descricao_uk UNIQUE (descricao)
);

CREATE TABLE IF NOT EXISTS FUNCIONARIO (
	id_funcionario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nome VARCHAR(255) NOT NULL,
	cpf CHAR(11) NOT NULL,
	data_nascimento DATE NOT NULL,
	email VARCHAR(255) NOT NULL,
	telefone CHAR(11) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
	id_cargo TINYINT UNSIGNED NOT NULL,
	registrado_por BIGINT UNSIGNED NOT NULL,
    data_registro DATETIME NOT NULL,
    modificado_por BIGINT UNSIGNED,
    data_modificacao DATETIME,

	CONSTRAINT funcionario_id_pk PRIMARY KEY (id_funcionario),
	CONSTRAINT funcionario_cpf_uk UNIQUE (cpf),
	CONSTRAINT funcionario_email_uk UNIQUE (email),
	CONSTRAINT funcionario_cargo_fk FOREIGN KEY (id_cargo) REFERENCES CARGO(id_cargo)
);

CREATE TABLE IF NOT EXISTS DISCIPLINA (
	id_disciplina TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	descricao VARCHAR(255) NOT NULL,
	registrado_por BIGINT UNSIGNED NOT NULL,
    data_registro DATETIME NOT NULL,
    modificado_por BIGINT UNSIGNED,
    data_modificacao DATETIME,

	CONSTRAINT disciplina_id_pk PRIMARY KEY (id_disciplina),
	CONSTRAINT disciplina_descricao_uk UNIQUE (descricao)
);

CREATE TABLE IF NOT EXISTS PROFESSOR_DISCIPLINA (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_funcionario BIGINT UNSIGNED NOT NULL,
	id_disciplina TINYINT UNSIGNED NOT NULL,
	registrado_por BIGINT UNSIGNED NOT NULL,
    data_registro DATETIME NOT NULL,
    modificado_por BIGINT UNSIGNED,
    data_modificacao DATETIME,

	CONSTRAINT professordisciplina_id_pk PRIMARY KEY (id),
	CONSTRAINT professordisciplina_idFunc_fk FOREIGN KEY (id_funcionario) REFERENCES FUNCIONARIO(id_funcionario),
	CONSTRAINT professordisciplina_idDisc_fk FOREIGN KEY (id_disciplina) REFERENCES DISCIPLINA(id_disciplina),
	CONSTRAINT professordisciplina_idFunc_idDisc_uk UNIQUE (id_funcionario, id_disciplina)
);

CREATE TABLE IF NOT EXISTS SALA (
	id_sala TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nome VARCHAR(255) NOT NULL,
	vagas TINYINT UNSIGNED NOT NULL,
	capacidade TINYINT UNSIGNED NOT NULL,
	esta_desativada BOOLEAN NOT NULL DEFAULT 0,
	registrado_por BIGINT UNSIGNED NOT NULL,
    data_registro DATETIME NOT NULL,
    modificado_por BIGINT UNSIGNED,
    data_modificacao DATETIME,

	CONSTRAINT sala_id_pk PRIMARY KEY (id_sala),
	CONSTRAINT sala_vagas_ck CHECK (vagas > 0)
);

CREATE TABLE IF NOT EXISTS AULA (
	id_aula BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	if_professor_disciplina BIGINT UNSIGNED NOT NULL,
	id_sala TINYINT UNSIGNED NOT NULL,
	horario_inicio DATETIME NOT NULL,
	horario_fim DATETIME NOT NULL,
	registrado_por BIGINT UNSIGNED NOT NULL,
    data_registro DATETIME NOT NULL,
    modificado_por BIGINT UNSIGNED,
    data_modificacao DATETIME,

	CONSTRAINT aula_id_pk PRIMARY KEY (id_aula),
	CONSTRAINT aula_idProfDisc_fk FOREIGN KEY (if_professor_disciplina) REFERENCES PROFESSOR_DISCIPLINA(id),
	CONSTRAINT aula_idSala_fk FOREIGN KEY (id_sala) REFERENCES SALA(id_sala),
	CONSTRAINT aula_horarioInicioFim_ck CHECK (horario_inicio > horario_fim)
);

CREATE TABLE IF NOT EXISTS ALUNO_AULA (
	id_aluno BIGINT UNSIGNED,
	id_aula BIGINT UNSIGNED,

	CONSTRAINT alunoaula_idAluno_idAula_pk PRIMARY KEY (id_aluno, id_aula),
	CONSTRAINT alunoaula_idAluno_fk FOREIGN KEY (id_aluno) REFERENCES ALUNO(id_aluno),
	CONSTRAINT alunoaula_idAula_fk FOREIGN KEY (id_aula) REFERENCES AULA(id_aula)
);