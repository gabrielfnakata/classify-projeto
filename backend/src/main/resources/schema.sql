CREATE TABLE IF NOT EXISTS STUDENT (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	birth_date DATE NOT NULL,
	registration_date DATE NOT NULL,
	email VARCHAR(320) NOT NULL,
	telephone CHAR(11) NOT NULL,
	address VARCHAR(200) NOT NULL,

	CONSTRAINT student_id_pk PRIMARY KEY (id),
	CONSTRAINT student_uuid_uk UNIQUE (uuid),
	CONSTRAINT student_email_uk UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS GUARDIAN (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    telephone CHAR(11) NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,

    CONSTRAINT guardian_id_pk PRIMARY KEY (id),
    CONSTRAINT guardian_idStudent_fk FOREIGN KEY (student_id) REFERENCES STUDENT(id)
);

CREATE TABlE IF NOT EXISTS ROLE (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    description VARCHAR(40) NOT NULL,

    CONSTRAINT role_id_pk PRIMARY KEY (id),
    CONSTRAINT role_description_uk UNIQUE (description)
);

CREATE TABLE IF NOT EXISTS EMPLOYEE (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	password VARCHAR(30) NOT NULL,
	cpf CHAR(11) NOT NULL,
	birth_date DATE NOT NULL,
	email VARCHAR(320) NOT NULL,
	telephone CHAR(11) NOT NULL,
    address VARCHAR(200) NOT NULL,
	role_id TINYINT UNSIGNED NOT NULL,

	CONSTRAINT employee_id_pk PRIMARY KEY (id),
	CONSTRAINT employee_uuid_uk UNIQUE (uuid),
	CONSTRAINT employee_cpf_uk UNIQUE (cpf),
	CONSTRAINT employee_email_uk UNIQUE (email),
	CONSTRAINT employee_roleId_fk FOREIGN KEY (role_id) REFERENCES ROLE(id)
);

CREATE TABLE IF NOT EXISTS SUBJECT (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	description VARCHAR(40) NOT NULL,

	CONSTRAINT subject_id_pk PRIMARY KEY (id),
	CONSTRAINT subject_uuid_uk UNIQUE(uuid),
	CONSTRAINT subject_description_uk UNIQUE (description)
);

CREATE TABLE IF NOT EXISTS SUBJECT_TEACHER (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	employee_id BIGINT UNSIGNED NOT NULL,
	subject_id TINYINT UNSIGNED NOT NULL,

	CONSTRAINT subjectTeacher_id_pk PRIMARY KEY (id),
	CONSTRAINT subjectTeacher_uuid_uk UNIQUE (uuid),
	CONSTRAINT subjectTeacher_idEmp_fk FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id),
	CONSTRAINT subjectTeacher_idSubj_fk FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
	CONSTRAINT subjectTeacher_idEmp_idSubj_uk UNIQUE (employee_id, subject_id)
);

CREATE TABLE IF NOT EXISTS CLASSROOM (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	capacity TINYINT UNSIGNED NOT NULL,
	is_disabled BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT classRoom_id_pk PRIMARY KEY (id),
	CONSTRAINT classRoom_uuid_uk UNIQUE (uuid),
	CONSTRAINT classRoom_capacity_ck CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS CLASS_SESSION (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	teacher_subject_id BIGINT UNSIGNED NOT NULL,
	classroom_id TINYINT UNSIGNED NOT NULL,
	start_time DATETIME NOT NULL,
	end_time DATETIME NOT NULL,

	CONSTRAINT classSession_id_pk PRIMARY KEY (id),
	CONSTRAINT classSession_uuid_uk UNIQUE (uuid),
	CONSTRAINT classSession_idTeacherSubj_fk FOREIGN KEY (teacher_subject_id) REFERENCES TEACHER_SUBJECT(id),
	CONSTRAINT classSession_idClassroom_fk FOREIGN KEY (classroom_id) REFERENCES CLASSROOM(id),
	CONSTRAINT classSession_startEndTime_ck CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS STUDENT_CLASS_SESSION (
	student_id BIGINT UNSIGNED,
	class_session_id BIGINT UNSIGNED,

	CONSTRAINT studentClass_idStud_idClass_pk PRIMARY KEY (student_id, class_session_id),
	CONSTRAINT studentClass_idStud_fk FOREIGN KEY (student_id) REFERENCES STUDENT(id),
	CONSTRAINT studentClass_idClass_fk FOREIGN KEY (class_session_id) REFERENCES CLASS_SESSION(id)
);

CREATE TABLE IF NOT EXISTS AUDIT (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(21) NOT NULL,
    register_id BIGINT UNSIGNED NOT NULL,
    operation CHAR(6) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATETIME NOT NULL,
    old_data JSON,
    new_data JSON,

    CONSTRAINT audit_id_pk PRIMARY KEY (id),
    CONSTRAINT audit_tableName_ck CHECK (table_name IN ('STUDENT', 'GUARDIAN', 'ROLE', 'EMPLOYEE', 'SUBJECT', 'TEACHER_SUBJECT', 'CLASSROOM',  'CLASS_SESSION', 'STUDENT_CLASS_SESSION')),
    CONSTRAINT audit_operation_ck CHECK (operation IN ('INSERT', 'DELETE', 'UPDATE')),
    CONSTRAINT audit_userId_fk FOREIGN KEY (user_id) REFERENCES EMPLOYEE(id),
    CONSTRAINT audit_oldNewData_ck CHECK (old_data != new_data)
);