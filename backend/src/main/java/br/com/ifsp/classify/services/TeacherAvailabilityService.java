package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.TeacherAvailabilityCreateDTO;
import br.com.ifsp.classify.dtos.get.TeacherAvailabilityGetDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.TeacherAvailability;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.TeacherAvailabilityRepository;
import br.com.ifsp.classify.specifications.ClassSessionSpecification;
import br.com.ifsp.classify.specifications.EmployeeSpecification;
import br.com.ifsp.classify.specifications.TeacherAvailabilitySpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Disponibilidade semanal dos professores. Regra: quem não cadastrou nenhum bloco atende em
 * qualquer horário; quem cadastrou só pode ter aula dentro dos blocos.
 */
@Service
public class TeacherAvailabilityService {

    private static final DateTimeFormatter HOUR = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_HOUR = DateTimeFormatter.ofPattern("dd/MM HH:mm");
    private static final Map<DayOfWeek, String> WEEKDAY_LABELS = Map.of(
            DayOfWeek.MONDAY, "segunda", DayOfWeek.TUESDAY, "terça", DayOfWeek.WEDNESDAY, "quarta",
            DayOfWeek.THURSDAY, "quinta", DayOfWeek.FRIDAY, "sexta", DayOfWeek.SATURDAY, "sábado",
            DayOfWeek.SUNDAY, "domingo");

    private final TeacherAvailabilityRepository repository;
    private final EmployeeRepository employeeRepository;
    private final ClassSessionRepository classSessionRepository;

    public TeacherAvailabilityService(TeacherAvailabilityRepository repository, EmployeeRepository employeeRepository,
            ClassSessionRepository classSessionRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.classSessionRepository = classSessionRepository;
    }

    public List<TeacherAvailabilityGetDTO> listByEmployee(String employeeUuid) {
        return toDTOs(blocksOf(findEmployee(employeeUuid)));
    }

    public List<TeacherAvailabilityGetDTO> add(String employeeUuid, TeacherAvailabilityCreateDTO dto) {
        if (dto == null)
            return null;

        Employee employee = findEmployee(employeeUuid);
        DayOfWeek weekday = parseWeekday(dto.weekday());

        if (dto.startTime() == null || dto.endTime() == null)
            throw new DtoException("Informe o horário de início e de fim");
        if (!dto.startTime().isBefore(dto.endTime()))
            throw new DtoException("O horário de início deve ser antes do fim");

        List<TeacherAvailability> blocks = blocksOf(employee);
        for (TeacherAvailability block : blocks) {
            boolean overlaps = block.getWeekday() == weekday
                    && dto.startTime().isBefore(block.getEndTime())
                    && block.getStartTime().isBefore(dto.endTime());
            if (overlaps)
                throw new DtoException("Esse horário sobrepõe um bloco já cadastrado (" + describe(block) + ")");
        }

        TeacherAvailability block = new TeacherAvailability();
        block.setUuid(UuidUtils.generateUUID());
        block.setEmployee(employee);
        block.setWeekday(weekday);
        block.setStartTime(dto.startTime());
        block.setEndTime(dto.endTime());
        repository.save(block);

        blocks.add(block);
        return toDTOs(blocks);
    }

    public List<TeacherAvailabilityGetDTO> remove(String employeeUuid, String availabilityUuid) {
        Employee employee = findEmployee(employeeUuid);
        TeacherAvailability block = repository
                .findOne(TeacherAvailabilitySpecification.getByUUID(availabilityUuid))
                .orElse(null);

        if (block == null || !block.getEmployee().getId().equals(employee.getId()))
            throw new DtoException("O bloco de disponibilidade informado não foi encontrado");

        List<TeacherAvailability> remaining = blocksOf(employee).stream()
                .filter(b -> !b.getId().equals(block.getId()))
                .collect(Collectors.toList());

        // Só bloqueia o que a remoção de fato quebra: aulas futuras que este bloco cobria e que
        // nenhum outro cobre. Aulas já fora da disponibilidade (agendadas antes dela existir) não
        // impedem a remoção — senão o professor ficaria preso aos blocos que cadastrou por engano.
        if (!remaining.isEmpty()) {
            List<TeacherAvailability> current = blocksOf(employee);
            LocalDateTime now = LocalDateTime.now();
            List<ClassSession> broken = classSessionRepository
                    .findAll(ClassSessionSpecification.filter(null, employeeUuid, null, null, null))
                    .stream()
                    .filter(s -> !s.getStartTime().isBefore(now)
                            && !s.isCanceled()
                            && isCovered(current, s.getStartTime(), s.getEndTime())
                            && !isCovered(remaining, s.getStartTime(), s.getEndTime()))
                    .sorted(Comparator.comparing(ClassSession::getStartTime))
                    .toList();

            if (!broken.isEmpty())
                throw new DtoException("Não é possível remover " + describe(block) + ": " + broken.size()
                        + " aula(s) futura(s) ficariam fora da disponibilidade (primeira em "
                        + broken.get(0).getStartTime().format(DATE_HOUR) + "). Altere os agendamentos antes.");
        }

        repository.delete(block);
        return toDTOs(remaining);
    }

    /** Lança DtoException se o professor tiver disponibilidade cadastrada e a aula cair fora dela. */
    public void assertAvailable(Employee employee, LocalDateTime start, LocalDateTime end) {
        List<TeacherAvailability> blocks = blocksOf(employee);
        if (blocks.isEmpty() || isCovered(blocks, start, end))
            return;

        throw new DtoException("O professor " + employee.getName() + " não atende "
                + WEEKDAY_LABELS.get(start.getDayOfWeek()) + " das " + start.toLocalTime().format(HOUR)
                + " às " + end.toLocalTime().format(HOUR) + ". Disponibilidade: " + describe(blocks));
    }

    private boolean isCovered(List<TeacherAvailability> blocks, LocalDateTime start, LocalDateTime end) {
        if (!start.toLocalDate().equals(end.toLocalDate()))
            return false;

        DayOfWeek day = start.getDayOfWeek();
        LocalTime from = start.toLocalTime();
        LocalTime to = end.toLocalTime();
        return blocks.stream().anyMatch(block -> block.covers(day, from, to));
    }

    private List<TeacherAvailability> blocksOf(Employee employee) {
        return repository.findAll(TeacherAvailabilitySpecification.getByEmployeeId(employee.getId()))
                .stream()
                .sorted(Comparator.comparing(TeacherAvailability::getWeekday).thenComparing(TeacherAvailability::getStartTime))
                .collect(Collectors.toList());
    }

    private Employee findEmployee(String employeeUuid) {
        if (Utils.isNullOrEmpty(employeeUuid))
            throw new DtoException("É necessário informar o funcionário");

        Employee employee = employeeRepository.findOne(EmployeeSpecification.getByUUID(employeeUuid)).orElse(null);
        if (employee == null)
            throw new DtoException("O funcionário informado não existe");

        return employee;
    }

    private static DayOfWeek parseWeekday(String weekday) {
        if (Utils.isNullOrEmpty(weekday))
            throw new DtoException("Informe o dia da semana");
        try {
            return DayOfWeek.valueOf(weekday.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new DtoException("Dia da semana inválido: " + weekday);
        }
    }

    private static String describe(TeacherAvailability block) {
        return WEEKDAY_LABELS.get(block.getWeekday()) + " " + block.getStartTime().format(HOUR)
                + "–" + block.getEndTime().format(HOUR);
    }

    private static String describe(List<TeacherAvailability> blocks) {
        return blocks.stream().map(TeacherAvailabilityService::describe).collect(Collectors.joining(", "));
    }

    private static List<TeacherAvailabilityGetDTO> toDTOs(List<TeacherAvailability> blocks) {
        return blocks.stream()
                .map(block -> new TeacherAvailabilityGetDTO(
                        UuidUtils.convertBytesToString(block.getUuid()),
                        block.getWeekday().name(),
                        block.getStartTime(),
                        block.getEndTime()))
                .toList();
    }
}
