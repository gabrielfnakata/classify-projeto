package br.com.ifsp.classify;

import br.com.ifsp.classify.dtos.AttendanceBulkSaveDTO;
import br.com.ifsp.classify.dtos.AttendanceRecordInputDTO;
import br.com.ifsp.classify.dtos.create.AddressCreateDTO;
import br.com.ifsp.classify.dtos.create.ClassCreateDTO;
import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.ReportCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.dtos.create.TeacherAvailabilityCreateDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionStatusUpdateDTO;
import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.create.UserCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.get.ClassroomGetDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.get.SubjectTeacherGetDTO;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.services.AttendanceService;
import br.com.ifsp.classify.services.ClassService;
import br.com.ifsp.classify.services.ClassSessionService;
import br.com.ifsp.classify.services.ClassroomService;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.StudentService;
import br.com.ifsp.classify.services.SubjectService;
import br.com.ifsp.classify.services.SubjectTeacherService;
import br.com.ifsp.classify.services.TeacherAvailabilityService;
import br.com.ifsp.classify.utils.ApplicationClock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * Popula o banco com uma massa de dados realista (alunos, funcionários, disciplinas, turmas,
 * salas, agendamentos e chamadas) na primeira subida. Roda depois do {@link DataInitializer}
 * e só quando ainda não existe nenhum aluno, então é seguro deixar ligado: em bancos já
 * populados ele não faz nada.
 *
 * Desligue com {@code classify.seed.demo=false}.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@ConditionalOnProperty(name = "classify.seed.demo", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private static final String DEFAULT_PASSWORD = "123456aA";
    private static final String REPORT_CONTENT = "Aula agendada.";

    private static final int STUDENT_COUNT = 50;
    private static final int EMPLOYEE_COUNT = 20;   // inclui os 2 do DataInitializer
    private static final int CLASS_GROUP_COUNT = 20;
    private static final int CLASSROOM_COUNT = 10;
    private static final int WEEKS_BEFORE = 6;      // histórico com chamadas feitas
    private static final int WEEKS_AFTER = 8;       // agenda futura

    private static final String[] FIRST_NAMES = {
        "Ana", "Beatriz", "Bruno", "Camila", "Carlos", "Daniel", "Eduarda", "Felipe", "Fernanda", "Gabriel",
        "Giovanna", "Gustavo", "Helena", "Henrique", "Isabela", "João", "Júlia", "Larissa", "Leonardo", "Letícia",
        "Lucas", "Luiza", "Manuela", "Marcos", "Mariana", "Mateus", "Nicolas", "Paulo", "Pedro", "Rafael",
        "Rafaela", "Renata", "Ricardo", "Rodrigo", "Sofia", "Thiago", "Valentina", "Vinícius", "Vitória", "Yasmin",
    };
    private static final String[] LAST_NAMES = {
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
        "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
        "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas",
    };
    private static final String[] SUBJECTS = {
        "Matemática", "Português", "História", "Geografia", "Física",
        "Química", "Biologia", "Inglês", "Artes", "Educação Física",
    };
    private static final String[] CLASSROOMS = {
        "Sala 101", "Sala 102", "Sala 103", "Sala 201", "Sala 202",
        "Laboratório de Informática", "Laboratório de Ciências", "Auditório", "Sala de Artes", "Quadra",
    };
    private static final int[] CLASSROOM_CAPACITIES = { 20, 20, 25, 25, 30, 18, 16, 60, 20, 40 };
    private static final String[] NEIGHBORHOODS = { "Centro", "Jardim América", "Vila Nova", "Bela Vista", "Santa Cruz" };
    private static final String[] STREETS = { "Rua das Flores", "Avenida Brasil", "Rua XV de Novembro", "Rua São João", "Avenida Paulista" };
    private static final String[] JUSTIFICATIONS = { "ATESTADO_MEDICO", "PROBLEMA_FAMILIAR", "TRANSPORTE", "OUTRO" };
    private static final String[] CANCELLATION_REASONS = {
        "Feriado municipal", "Professor ausente", "Reunião pedagógica", "Manutenção na sala",
    };

    private record Slot(DayOfWeek day, LocalTime start, LocalTime end) {}

    private static final Slot[] SLOTS = buildSlots();

    private final StudentRepository studentRepository;
    private final EmployeeService employeeService;
    private final StudentService studentService;
    private final SubjectService subjectService;
    private final SubjectTeacherService subjectTeacherService;
    private final ClassroomService classroomService;
    private final ClassService classService;
    private final ClassSessionService classSessionService;
    private final AttendanceService attendanceService;
    private final TeacherAvailabilityService availabilityService;
    private final ApplicationClock clock;
    // Fora de uma requisição não há sessão do Hibernate (open-in-view), então cada etapa roda
    // na própria transação para os DTOs conseguirem ler as coleções lazy (telefones, alunos...).
    private final TransactionTemplate transaction;

    // Semente fixa: a massa gerada é sempre a mesma, o que facilita testar e comparar.
    private final Random random = new Random(2026);
    private final Set<String> usedCpfs = new HashSet<>();
    private int telephoneSequence = 0;

    public DemoDataSeeder(StudentRepository studentRepository, EmployeeService employeeService,
            StudentService studentService, SubjectService subjectService, SubjectTeacherService subjectTeacherService,
            ClassroomService classroomService, ClassService classService, ClassSessionService classSessionService,
            AttendanceService attendanceService, TeacherAvailabilityService availabilityService,
            ApplicationClock clock, PlatformTransactionManager transactionManager) {
        this.studentRepository = studentRepository;
        this.employeeService = employeeService;
        this.studentService = studentService;
        this.subjectService = subjectService;
        this.subjectTeacherService = subjectTeacherService;
        this.classroomService = classroomService;
        this.classService = classService;
        this.classSessionService = classSessionService;
        this.attendanceService = attendanceService;
        this.availabilityService = availabilityService;
        this.clock = clock;
        this.transaction = new TransactionTemplate(transactionManager);
    }

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0)
            return;

        long startedAt = System.currentTimeMillis();
        log.info("Banco vazio: gerando massa de dados de demonstração...");

        List<EmployeeGetDTO> teachers = transaction.execute(status -> seedEmployees());
        List<SubjectGetDTO> subjects = transaction.execute(status -> seedSubjects());
        List<SubjectTeacherGetDTO> links = transaction.execute(status -> seedSubjectTeachers(teachers, subjects));
        List<ClassroomGetDTO> classrooms = transaction.execute(status -> seedClassrooms());
        List<StudentGetDTO> students = transaction.execute(status -> seedStudents());
        Map<String, List<String>> studentsByClass = new java.util.HashMap<>();
        List<ClassGetDTO> classGroups = transaction.execute(status -> seedClassGroups(students, studentsByClass));
        List<ClassSessionGetDTO> sessions = transaction.execute(status -> seedSessions(classGroups, students, links, classrooms));
        int attendances = transaction.execute(status -> seedAttendance(sessions, studentsByClass));
        transaction.execute(status -> { seedAvailability(teachers, sessions); return null; });
        int canceled = transaction.execute(status -> seedCancellations(sessions));

        log.info("Massa de demonstração pronta em {} s: {} funcionários, {} disciplinas, {} salas, {} alunos, "
                + "{} turmas, {} aulas, {} chamadas registradas, {} aula(s) cancelada(s).",
            (System.currentTimeMillis() - startedAt) / 1000,
            EMPLOYEE_COUNT, subjects.size(), classrooms.size(), students.size(),
            classGroups.size(), sessions.size(), attendances, canceled);
    }

    // ---------------------------------------------------------------- funcionários

    private List<EmployeeGetDTO> seedEmployees() {
        List<EmployeeGetDTO> teachers = new ArrayList<>();

        // Já existem ADMINISTRADOR (admin) e GLAUCO (professor), criados pelo DataInitializer.
        List<EmployeeGetDTO> existingEmployees = employeeService.findAll();
        for (EmployeeGetDTO existing : existingEmployees) {
            usedCpfs.add(existing.cpf());
            if ("GLAUCO".equals(existing.name()))
                teachers.add(existing);
        }

        int remaining = EMPLOYEE_COUNT - existingEmployees.size();
        for (int i = 0; i < remaining; i++) {
            // 2 secretárias, 1 admin extra, o resto professores.
            String role = i < 2 ? "SECRE" : i == 2 ? "ADMIN" : "PROFE";
            String name = fullName();
            String email = emailFor(name, "classify.com");

            EmployeeGetDTO employee = attempt("funcionário " + name, () -> employeeService.create(new EmployeeCreateDTO(
                name,
                randomDate(1970, 1998),
                generateCpf(),
                randomDate(2015, 2025),
                new UserCreateDTO(email, DEFAULT_PASSWORD, role, null),
                List.of(telephone())
            )));

            if (employee != null && role.equals("PROFE"))
                teachers.add(employee);
        }

        return teachers;
    }

    // ---------------------------------------------------------------- disciplinas

    private List<SubjectGetDTO> seedSubjects() {
        Set<String> existing = subjectService.findAll().stream()
            .map(s -> s.description().toUpperCase())
            .collect(Collectors.toSet());

        for (String subject : SUBJECTS) {
            if (!existing.contains(subject.toUpperCase()))
                attempt("disciplina " + subject, () -> subjectService.create(new SubjectCreateDTO(subject)));
        }

        return subjectService.findAll();
    }

    private List<SubjectTeacherGetDTO> seedSubjectTeachers(List<EmployeeGetDTO> teachers, List<SubjectGetDTO> subjects) {
        Set<String> existing = subjectTeacherService.findAll().stream()
            .map(link -> link.employee().uuid() + "|" + link.subject().uuid())
            .collect(Collectors.toSet());

        // Cada disciplina tem pelo menos um professor; cada professor dá 1 ou 2 disciplinas.
        for (int i = 0; i < subjects.size(); i++)
            link(teachers.get(i % teachers.size()), subjects.get(i), existing);

        for (EmployeeGetDTO teacher : teachers) {
            int extra = random.nextInt(2);
            for (int i = 0; i < extra; i++)
                link(teacher, pick(subjects), existing);
        }

        return subjectTeacherService.findAll();
    }

    private void link(EmployeeGetDTO teacher, SubjectGetDTO subject, Set<String> existing) {
        if (!existing.add(teacher.uuid() + "|" + subject.uuid()))
            return;

        attempt("vínculo " + teacher.name() + " × " + subject.description(),
            () -> subjectTeacherService.create(new SubjectTeacherCreateDTO(teacher.uuid(), subject.uuid())));
    }

    // ---------------------------------------------------------------- salas

    private List<ClassroomGetDTO> seedClassrooms() {
        for (int i = 0; i < CLASSROOM_COUNT; i++) {
            String name = CLASSROOMS[i];
            int capacity = CLASSROOM_CAPACITIES[i];
            boolean disabled = i == CLASSROOM_COUNT - 1; // uma sala desativada, para a tela mostrar o estado
            attempt("sala " + name, () -> classroomService.create(new ClassroomCreateDTO(name, capacity, disabled)));
        }

        return classroomService.findAll();
    }

    // ---------------------------------------------------------------- alunos

    private List<StudentGetDTO> seedStudents() {
        List<StudentGetDTO> students = new ArrayList<>();

        for (int i = 0; i < STUDENT_COUNT; i++) {
            String name = fullName();
            String lastName = name.substring(name.indexOf(' ') + 1);
            List<GuardianCreateDTO> guardians = new ArrayList<>();
            guardians.add(guardian(lastName));
            if (random.nextInt(4) == 0)
                guardians.add(guardian(lastName));

            StudentGetDTO student = attempt("aluno " + name, () -> studentService.create(new StudentCreateDTO(
                name,
                randomDate(2008, 2014),
                emailFor(name, "email.com"),
                generateCpf(),
                randomDate(2023, 2026),
                List.of(telephone()),
                guardians
            )));

            if (student != null)
                students.add(student);
        }

        return students;
    }

    private GuardianCreateDTO guardian(String familyName) {
        String name = pick(FIRST_NAMES) + " " + familyName;
        return new GuardianCreateDTO(
            name,
            generateCpf(),
            emailFor(name, "email.com"),
            List.of(telephone()),
            new AddressCreateDTO(
                String.format("%08d", 1000000 + random.nextInt(8999999)),
                pick(STREETS),
                String.valueOf(10 + random.nextInt(990)),
                random.nextBoolean() ? "Apto " + (1 + random.nextInt(120)) : null,
                pick(NEIGHBORHOODS),
                "São Paulo",
                "SP"
            )
        );
    }

    // ---------------------------------------------------------------- turmas

    private List<ClassGetDTO> seedClassGroups(List<StudentGetDTO> students, Map<String, List<String>> studentsByClass) {
        String[] years = { "6º", "7º", "8º", "9º", "1º EM", "2º EM", "3º EM" };
        String[] shifts = { "Manhã", "Tarde" };
        List<ClassGetDTO> classGroups = new ArrayList<>();

        for (int i = 0; i < CLASS_GROUP_COUNT; i++) {
            String year = years[i % years.length];
            String letter = String.valueOf((char) ('A' + (i / years.length)));
            String name = year + " " + letter;
            String description = year + " ano · turno da " + shifts[i % shifts.length].toLowerCase();

            ClassGetDTO classGroup = attempt("turma " + name,
                () -> classService.create(new ClassCreateDTO(name, description)));
            if (classGroup == null)
                continue;

            // 8 a 14 alunos por turma; um aluno pode estar em mais de uma.
            int size = 8 + random.nextInt(7);
            List<String> enrolled = new ArrayList<>(shuffled(students).subList(0, size)).stream()
                .map(StudentGetDTO::uuid)
                .toList();

            attempt("matrícula em " + name, () -> classService.addStudents(classGroup.uuid(), enrolled));
            studentsByClass.put(classGroup.uuid(), enrolled);
            classGroups.add(classGroup);
        }

        return classGroups;
    }

    // ---------------------------------------------------------------- agendamentos

    private List<ClassSessionGetDTO> seedSessions(List<ClassGetDTO> classGroups, List<StudentGetDTO> students,
            List<SubjectTeacherGetDTO> links, List<ClassroomGetDTO> classrooms) {
        List<ClassSessionGetDTO> created = new ArrayList<>();
        List<ClassroomGetDTO> activeRooms = classrooms.stream().filter(room -> !room.isDisabled()).toList();

        // Ocupação por (dia, horário): nem professor nem sala repetem no mesmo slot, então
        // nenhuma aula gerada cai na validação de conflito do ClassSessionService.
        Set<String> busyTeacherSlots = new HashSet<>();
        Set<String> busyRoomSlots = new HashSet<>();

        LocalDate today = clock.today();
        LocalDate firstMonday = today.minusWeeks(WEEKS_BEFORE).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate lastDay = today.plusWeeks(WEEKS_AFTER);

        // Cada turma tem 2 recorrências semanais (disciplinas diferentes).
        for (ClassGetDTO classGroup : classGroups) {
            int classSize = classGroup.students().size();
            for (int n = 0; n < 2; n++) {
                SubjectTeacherGetDTO link = pick(links);
                ClassroomGetDTO room = pickRoomWithCapacity(activeRooms, classSize);
                Slot slot = freeSlot(link.employee().uuid(), room.uuid(), busyTeacherSlots, busyRoomSlots);
                if (slot == null)
                    continue;

                String recurrence = UUID.randomUUID().toString();
                for (LocalDate date = firstMonday.with(TemporalAdjusters.nextOrSame(slot.day()));
                        !date.isAfter(lastDay); date = date.plusWeeks(1)) {
                    ClassSessionGetDTO session = createSession(link, room, slot, date, recurrence, classGroup.uuid(), null);
                    if (session != null)
                        created.add(session);
                }
            }
        }

        // Aulas individuais avulsas (reforço) para alguns alunos, espalhadas no período.
        for (int i = 0; i < 25; i++) {
            SubjectTeacherGetDTO link = pick(links);
            ClassroomGetDTO room = pick(activeRooms);
            Slot slot = freeSlot(link.employee().uuid(), room.uuid(), busyTeacherSlots, busyRoomSlots);
            if (slot == null)
                continue;

            LocalDate date = firstMonday.plusDays(random.nextInt((WEEKS_BEFORE + WEEKS_AFTER) * 7))
                .with(TemporalAdjusters.nextOrSame(slot.day()));
            ClassSessionGetDTO session = createSession(link, room, slot, date, null, null, pick(students).uuid());
            if (session != null)
                created.add(session);
        }

        return created;
    }

    private ClassSessionGetDTO createSession(SubjectTeacherGetDTO link, ClassroomGetDTO room, Slot slot,
            LocalDate date, String recurrence, String classUuid, String studentUuid) {
        return attempt("aula " + link.subject().description() + " em " + date, () -> classSessionService.create(
            new ClassSessionCreateDTO(
                link.uuid(),
                room.uuid(),
                LocalDateTime.of(date, slot.start()),
                LocalDateTime.of(date, slot.end()),
                new ReportCreateDTO(REPORT_CONTENT),
                classUuid,
                studentUuid,
                recurrence
            )));
    }

    private Slot freeSlot(String teacherUuid, String roomUuid, Set<String> busyTeacher, Set<String> busyRoom) {
        for (int attempt = 0; attempt < 40; attempt++) {
            Slot slot = pick(SLOTS);
            String key = slot.day() + "|" + slot.start();
            if (busyTeacher.contains(teacherUuid + "|" + key) || busyRoom.contains(roomUuid + "|" + key))
                continue;

            busyTeacher.add(teacherUuid + "|" + key);
            busyRoom.add(roomUuid + "|" + key);
            return slot;
        }
        return null;
    }

    private ClassroomGetDTO pickRoomWithCapacity(List<ClassroomGetDTO> rooms, int needed) {
        List<ClassroomGetDTO> fitting = rooms.stream().filter(room -> room.capacity() >= needed).toList();
        return pick(fitting.isEmpty() ? rooms : fitting);
    }

    private static Slot[] buildSlots() {
        DayOfWeek[] days = { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY };
        LocalTime[] starts = {
            LocalTime.of(7, 30), LocalTime.of(9, 20), LocalTime.of(11, 0),
            LocalTime.of(13, 30), LocalTime.of(15, 20), LocalTime.of(17, 0),
        };
        List<Slot> slots = new ArrayList<>();
        for (DayOfWeek day : days)
            for (LocalTime start : starts)
                slots.add(new Slot(day, start, start.plusMinutes(100)));
        return slots.toArray(new Slot[0]);
    }

    // ---------------------------------------------------------------- chamadas

    private int seedAttendance(List<ClassSessionGetDTO> sessions, Map<String, List<String>> studentsByClass) {
        LocalDateTime now = clock.now();
        int count = 0;

        for (ClassSessionGetDTO session : sessions) {
            if (session.classDTO() == null || !session.endTime().isBefore(now))
                continue;

            List<String> roster = studentsByClass.get(session.classDTO().uuid());
            if (roster == null)
                continue;

            List<AttendanceRecordInputDTO> records = new ArrayList<>();
            for (String studentUuid : roster) {
                boolean present = random.nextInt(100) < 88;
                boolean justified = !present && random.nextBoolean();
                records.add(new AttendanceRecordInputDTO(
                    studentUuid,
                    present ? "PRESENTE" : "AUSENTE",
                    justified ? pick(JUSTIFICATIONS) : null,
                    justified && random.nextBoolean() ? "Justificativa apresentada pelo responsável." : null
                ));
            }

            if (attempt("chamada da aula " + session.uuid(),
                    () -> attendanceService.bulkSaveForSession(session.uuid(), new AttendanceBulkSaveDTO(records))) != null)
                count += records.size();
        }

        return count;
    }

    // ---------------------------------------------------------------- disponibilidade

    /**
     * Cada professor atende nos dias em que já tem aula gerada (mais um dia extra), manhã e tarde.
     * Assim a disponibilidade fica coerente com a agenda e ainda sobra dia livre para o exemplo.
     */
    private void seedAvailability(List<EmployeeGetDTO> teachers, List<ClassSessionGetDTO> sessions) {
        DayOfWeek[] weekdays = { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY };

        for (EmployeeGetDTO teacher : teachers) {
            Set<DayOfWeek> days = sessions.stream()
                .filter(s -> s.subjectTeacher().employee().uuid().equals(teacher.uuid()))
                .map(s -> s.startTime().getDayOfWeek())
                .collect(Collectors.toCollection(java.util.TreeSet::new));
            days.add(pick(weekdays));

            for (DayOfWeek day : days) {
                for (LocalTime[] shift : new LocalTime[][] {
                        { LocalTime.of(7, 30), LocalTime.of(12, 40) },
                        { LocalTime.of(13, 30), LocalTime.of(18, 40) } }) {
                    attempt("disponibilidade de " + teacher.name() + " (" + day + ")", () ->
                        availabilityService.add(teacher.uuid(), new TeacherAvailabilityCreateDTO(day.name(), shift[0], shift[1])));
                }
            }
        }
    }

    // ---------------------------------------------------------------- cancelamentos

    /** Cancela algumas aulas futuras, para a agenda ter exemplos do estado "cancelada". */
    private int seedCancellations(List<ClassSessionGetDTO> sessions) {
        LocalDateTime now = clock.now();
        int canceled = 0;

        for (ClassSessionGetDTO session : sessions) {
            if (session.startTime().isBefore(now) || random.nextInt(100) >= 4)
                continue;

            if (attempt("cancelamento da aula " + session.uuid(), () -> classSessionService.changeStatus(
                    session.uuid(), new ClassSessionStatusUpdateDTO("CANCELED", pick(CANCELLATION_REASONS)))) != null)
                canceled++;
        }

        return canceled;
    }

    // ---------------------------------------------------------------- utilitários

    /** Executa a criação e, em vez de derrubar a subida da aplicação, registra e segue. */
    private <T> T attempt(String what, Supplier<T> action) {
        try {
            return action.get();
        } catch (RuntimeException e) {
            log.warn("Seed: não foi possível criar {} — {}", what, e.getMessage());
            return null;
        }
    }

    private <T> T pick(List<T> list) {
        return list.get(random.nextInt(list.size()));
    }

    private <T> T pick(T[] array) {
        return array[random.nextInt(array.length)];
    }

    private <T> List<T> shuffled(List<T> list) {
        List<T> copy = new ArrayList<>(list);
        java.util.Collections.shuffle(copy, random);
        return copy;
    }

    private String fullName() {
        return pick(FIRST_NAMES) + " " + pick(LAST_NAMES) + " " + pick(LAST_NAMES);
    }

    private String emailFor(String name, String domain) {
        String base = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toLowerCase()
            .replace(' ', '.');
        // Sufixo numérico garante unicidade mesmo com nomes repetidos.
        return base + (100 + random.nextInt(900)) + "@" + domain;
    }

    private LocalDate randomDate(int fromYear, int toYear) {
        int year = fromYear + random.nextInt(toYear - fromYear + 1);
        return LocalDate.of(year, 1 + random.nextInt(12), 1 + random.nextInt(28));
    }

    /** Telefone celular de SP com 11 dígitos, sequencial para nunca colidir com o UNIQUE(number). */
    private TelephoneCreateDTO telephone() {
        telephoneSequence++;
        String number = String.format("119%08d", 70000000 + telephoneSequence);
        return new TelephoneCreateDTO("BR", "11", number);
    }

    /** Gera um CPF válido (dígitos verificadores corretos) e ainda não usado. */
    private String generateCpf() {
        while (true) {
            int[] digits = new int[11];
            for (int i = 0; i < 9; i++)
                digits[i] = random.nextInt(10);
            digits[9] = cpfCheckDigit(digits, 9);
            digits[10] = cpfCheckDigit(digits, 10);

            StringBuilder cpf = new StringBuilder(11);
            for (int digit : digits)
                cpf.append(digit);

            String value = cpf.toString();
            if (!value.matches("(\\d)\\1{10}") && usedCpfs.add(value))
                return value;
        }
    }

    private static int cpfCheckDigit(int[] digits, int length) {
        int sum = 0;
        for (int i = 0; i < length; i++)
            sum += digits[i] * (length + 1 - i);
        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }
}
