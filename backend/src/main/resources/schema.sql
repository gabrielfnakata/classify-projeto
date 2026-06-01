CREATE TABLE IF NOT EXISTS address (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	zip_code CHAR(8) NOT NULL,
	street VARCHAR(150) NOT NULL,
	number VARCHAR(20) NOT NULL,
	complement VARCHAR(100),
	neighborhood VARCHAR(100) NOT NULL,
	city VARCHAR(100) NOT NULL,
	state CHAR(2) NOT NULL,

	CONSTRAINT address_id_pk PRIMARY KEY (id)
)$$

CREATE TABLE IF NOT EXISTS guardian (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
	cpf CHAR(11),
	email VARCHAR(320) NOT NULL,
    address_id BIGINT UNSIGNED,
	is_deleted BOOLEAN NOT NULL DEFAULT 0,

    CONSTRAINT guardian_id_pk PRIMARY KEY (id),
    CONSTRAINT guardian_uuid_uk UNIQUE (uuid),
	CONSTRAINT guardian_cpf_uk UNIQUE (cpf),
	CONSTRAINT guardian_cpf_email UNIQUE(email),
	CONSTRAINT guardian_addressId_fk FOREIGN KEY (address_id) REFERENCES address (id)
)$$

CREATE TABLE IF NOT EXISTS student (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	birth_date DATE NOT NULL,
	email VARCHAR(320),
	cpf CHAR(11),
	registration_date DATE NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT student_id_pk PRIMARY KEY (id),
	CONSTRAINT student_uuid_uk UNIQUE (uuid),
	CONSTRAINT student_email_uk UNIQUE (email),
	CONSTRAINT student_cpf_uk UNIQUE (cpf)
)$$

CREATE TABLE IF NOT EXISTS student_guardian (
	student_id BIGINT UNSIGNED NOT NULL,
	guardian_id BIGINT UNSIGNED NOT NULL,

	CONSTRAINT studentguardian_studentId_guardianId_pk PRIMARY KEY (student_id, guardian_id),
	CONSTRAINT studentguardian_studentId_fk FOREIGN KEY (student_id) REFERENCES student (id),
	CONSTRAINT studentguardian_guardianId_fk FOREIGN KEY (guardian_id) REFERENCES guardian (id)
)$$

CREATE TABLE IF NOT EXISTS class (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(25) NOT NULL,
	description VARCHAR(50),
	is_deleted BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT class_id_pk PRIMARY KEY (id),
	CONSTRAINT class_uuid_uk UNIQUE (uuid),
	CONSTRAINT class_name_uk UNIQUE (name)
)$$

CREATE TABLE IF NOT EXISTS student_class (
	student_id BIGINT UNSIGNED NOT NULL,
	class_id BIGINT UNSIGNED NOT NULL,

	CONSTRAINT studentclass_studentId_classId_pk PRIMARY KEY (student_id, class_id),
	CONSTRAINT studentclass_studentId_fk FOREIGN KEY (student_id) REFERENCES student (id),
	CONSTRAINT studentclass_classId_fk FOREIGN KEY (class_id) REFERENCES class (id)
)$$

CREATE TABLE IF NOT EXISTS role (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid BINARY(16) NOT NULL,
    description VARCHAR(40) NOT NULL,

    CONSTRAINT role_id_pk PRIMARY KEY (id),
    CONSTRAINT role_uuid_uk UNIQUE(uuid),
    CONSTRAINT role_description_uk UNIQUE (description)
)$$

CREATE TABLE IF NOT EXISTS user (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	email VARCHAR(320) NOT NULL,
	password VARCHAR(100) NOT NULL,
	refresh_token VARCHAR(255),
	created_at DATETIME DEFAULT NOW(),
	role_id TINYINT UNSIGNED NOT NULL,

	CONSTRAINT user_id_pk PRIMARY KEY (id),
	CONSTRAINT user_uuid_uk UNIQUE (uuid),
	CONSTRAINT user_email_uk UNIQUE (email),
	CONSTRAINT user_refreshToken_uk UNIQUE (refresh_token),
	CONSTRAINT user_roleId_fk FOREIGN KEY (role_id) REFERENCES role (id)
)$$

CREATE TABLE IF NOT EXISTS employee (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	birth_date DATE,
	cpf CHAR(11) NOT NULL,
	hire_date DATE,
	user_id BIGINT UNSIGNED NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT employee_id_pk PRIMARY KEY (id),
	CONSTRAINT employee_uuid_uk UNIQUE (uuid),
	CONSTRAINT employee_cpf_uk UNIQUE (cpf),
	CONSTRAINT employee_userId_fk FOREIGN KEY (user_id) REFERENCES user (id)
)$$

CREATE TABLE IF NOT EXISTS subject (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	description VARCHAR(40) NOT NULL,

	CONSTRAINT subject_id_pk PRIMARY KEY (id),
	CONSTRAINT subject_uuid_uk UNIQUE(uuid),
	CONSTRAINT subject_description_uk UNIQUE (description)
)$$

CREATE TABLE IF NOT EXISTS subject_teacher (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	employee_id BIGINT UNSIGNED NOT NULL,
	subject_id TINYINT UNSIGNED NOT NULL,

	CONSTRAINT subjectTeacher_id_pk PRIMARY KEY (id),
	CONSTRAINT subjectTeacher_uuid_uk UNIQUE (uuid),
	CONSTRAINT subjectTeacher_idEmp_fk FOREIGN KEY (employee_id) REFERENCES employee (id),
	CONSTRAINT subjectTeacher_idSubj_fk FOREIGN KEY (subject_id) REFERENCES subject (id),
	CONSTRAINT subjectTeacher_idEmp_idSubj_uk UNIQUE (employee_id, subject_id)
)$$

CREATE TABLE IF NOT EXISTS classroom (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	name VARCHAR(255) NOT NULL,
	capacity TINYINT UNSIGNED NOT NULL,
	is_disabled BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT classRoom_id_pk PRIMARY KEY (id),
	CONSTRAINT classRoom_uuid_uk UNIQUE (uuid),
	CONSTRAINT classRoom_capacity_ck CHECK (capacity > 0)
)$$

CREATE TABLE IF NOT EXISTS report (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	content MEDIUMTEXT NOT NULL,

	CONSTRAINT report_id_pk PRIMARY KEY (id)
)$$

CREATE TABLE IF NOT EXISTS class_session (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	uuid BINARY(16) NOT NULL,
	subject_teacher_id BIGINT UNSIGNED NOT NULL,
	classroom_id TINYINT UNSIGNED NOT NULL,
	start_time DATETIME NOT NULL,
	end_time DATETIME NOT NULL,
	report_id BIGINT UNSIGNED,
	class_id BIGINT UNSIGNED,
	student_id BIGINT UNSIGNED,

	CONSTRAINT classSession_id_pk PRIMARY KEY (id),
	CONSTRAINT classSession_uuid_uk UNIQUE (uuid),
	CONSTRAINT classSession_idTeacherSubj_fk FOREIGN KEY (subject_teacher_id) REFERENCES subject_teacher(id),
	CONSTRAINT classSession_idClassroom_fk FOREIGN KEY (classroom_id) REFERENCES classroom(id),
	CONSTRAINT classSession_startEndTime_ck CHECK (start_time < end_time),
	CONSTRAINT classSession_classId_ck CHECK (
		(CASE WHEN class_id IS NOT NULL THEN 1 ELSE 0 END) +
		(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) = 1
	)
)$$

CREATE TABLE IF NOT EXISTS assessment (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	description VARCHAR(300),
	grade VARCHAR(3),
	observation VARCHAR(150),
	class_session_id BIGINT UNSIGNED NOT NULL,

	CONSTRAINT assessment_id_pk PRIMARY KEY (id),
	CONSTRAINT assessment_classSessionId_fk FOREIGN KEY (class_session_id) REFERENCES class_session (id)
)$$

CREATE TABLE IF NOT EXISTS telephone (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	country VARCHAR(3),
	ddd VARCHAR(5),
	number VARCHAR(11) NOT NULL,
	guardian_id BIGINT UNSIGNED,
	student_id BIGINT UNSIGNED,
	employee_id BIGINT UNSIGNED,
	is_deleted BOOLEAN NOT NULL DEFAULT 0,

	CONSTRAINT telephone_id_pk PRIMARY KEY (id),
	CONSTRAINT telephone_number_uk UNIQUE (number),
	CONSTRAINT telephone_guardianId_fk FOREIGN KEY (guardian_id) REFERENCES guardian (id),
	CONSTRAINT telephone_studentId_fk FOREIGN KEY (student_id) REFERENCES student (id),
	CONSTRAINT telephone_employeeId_fk FOREIGN KEY (employee_id) REFERENCES employee (id),
	CONSTRAINT telephone_ids_ck CHECK (
		(CASE WHEN guardian_id IS NOT NULL THEN 1 ELSE 0 END) +
		(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) +
		(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) = 1
	)
)$$

CREATE TABLE IF NOT EXISTS audit (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(21) NOT NULL,
    register_id BIGINT UNSIGNED NOT NULL,
    operation CHAR(6) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATETIME NOT NULL,
    old_data JSON,
    new_data JSON NOT NULL,

    CONSTRAINT audit_id_pk PRIMARY KEY (id),
    CONSTRAINT audit_tableName_ck CHECK (table_name IN (
		'ADDRESS', 'GUARDIAN', 'STUDENT', 'USER', 
		'EMPLOYEE', 'SUBJECT', 'SUBJECT_TEACHER', 'CLASSROOM',
		'REPORT', 'CLASS', 'CLASS_SESSION', 'ASSESSMENT',
		'TELEPHONE'
	)),
    CONSTRAINT audit_operation_ck CHECK (operation IN ('INSERT', 'DELETE', 'UPDATE')),
    CONSTRAINT audit_userId_fk FOREIGN KEY (user_id) REFERENCES user (id),
    CONSTRAINT audit_oldNewData_ck CHECK (old_data != new_data)
);