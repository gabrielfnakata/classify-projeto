package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.create.TeacherMessageCreateDTO;
import br.com.ifsp.classify.services.TeacherMessageService;
import br.com.ifsp.classify.services.ScheduleRequestService;
import br.com.ifsp.classify.dtos.create.ScheduleRequestCreateDTO;
import br.com.ifsp.classify.dtos.filter.StudentFilterDTO;
import br.com.ifsp.classify.dtos.get.*;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.dtos.get.OptionGetDTO;
import br.com.ifsp.classify.services.AttendanceService;
import br.com.ifsp.classify.services.form.FormService;
import br.com.ifsp.classify.dtos.update.GuardianUpdateDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.StudentService;
import br.com.ifsp.classify.services.ClassSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/student", produces = MediaType.APPLICATION_JSON_VALUE)
public class StudentController extends AbstractController<StudentCreateDTO, StudentGetDTO, StudentUpdateDTO, StudentFilterDTO> {

    private final StudentService service;
    private final ClassSessionService classSessionService;
    private final AttendanceService attendanceService;
    private final FormService formService;
    private final TeacherMessageService teacherMessageService;
    private final ScheduleRequestService scheduleRequestService;

    public StudentController(StudentService service, ClassSessionService classSessionService, AttendanceService attendanceService,
            FormService formService, TeacherMessageService teacherMessageService, ScheduleRequestService scheduleRequestService) {
        super(service);
        this.service = service;
        this.classSessionService = classSessionService;
        this.attendanceService = attendanceService;
        this.formService = formService;
        this.teacherMessageService = teacherMessageService;
        this.scheduleRequestService = scheduleRequestService;
    }

    @GetMapping("/me")
    public ResponseEntity<StudentGetDTO> getCurrentStudent(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        StudentGetDTO student = service.getForUser(user.username());
        return (student != null)
                ? ResponseEntity.ok(student)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/me/schedule")
    public ResponseEntity<List<ClassSessionGetDTO>> getCurrentStudentSchedule(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        List<ClassSessionGetDTO> schedule = classSessionService.getScheduleForUser(user.username());
        return (schedule != null)
                ? ResponseEntity.ok(schedule)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<List<AttendanceGetDTO>> getCurrentStudentAttendance(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        List<AttendanceGetDTO> attendance = attendanceService.getForStudentAccount(user.username());
        return (attendance != null)
                ? ResponseEntity.ok(attendance)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping(value = "/me/schedule-requests", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> requestSchedule(@RequestBody ScheduleRequestCreateDTO request) {
        scheduleRequestService.request(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/messages", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> sendMessageToTeacher(@RequestBody TeacherMessageCreateDTO message) {
        teacherMessageService.sendToTeacher(message);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/options")
    public ResponseEntity<List<OptionGetDTO>> getOptions() {
        return ResponseEntity.ok(service.findOptions());
    }

    @GetMapping("/{uuid}/schedule")
    public ResponseEntity<List<ClassSessionGetDTO>> getStudentSchedule(@PathVariable String uuid) {
        List<ClassSessionGetDTO> schedule = classSessionService.getScheduleForStudentUuid(uuid);
        return (schedule != null)
                ? ResponseEntity.ok(schedule)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/{uuid}/attendance")
    public ResponseEntity<List<AttendanceGetDTO>> getStudentAttendance(@PathVariable String uuid) {
        List<AttendanceGetDTO> attendance = attendanceService.getForStudent(uuid);
        return (attendance != null)
                ? ResponseEntity.ok(attendance)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/{uuid}/forms")
    public ResponseEntity<List<FormGetDTO>> getStudentForms(@PathVariable String uuid) {
        List<FormGetDTO> forms = formService.getFormsForStudent(uuid);
        return (forms != null)
                ? ResponseEntity.ok(forms)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping("/{uuid}/guardians")
    public ResponseEntity<List<GuardianGetDTO>> addGuardians( @PathVariable String uuid, @RequestBody List<GuardianCreateDTO> guardiansDTO ) {
        List<GuardianGetDTO> guardians = service.addGuardians(uuid, guardiansDTO);

        return (guardians != null && !guardians.isEmpty())
                ? ResponseEntity.status(HttpStatus.CREATED).body(guardians)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @PutMapping("/{uuid}/guardians/{guardianUuid}")
    public ResponseEntity<GuardianGetDTO> updateGuardian(@PathVariable String uuid, @PathVariable String guardianUuid, @RequestBody GuardianUpdateDTO guardianDTO ) {
        GuardianGetDTO guardian = service.updateGuardian(uuid, guardianUuid, guardianDTO);

        return (guardian != null)
                ? ResponseEntity.ok(guardian)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @PutMapping(value = "/undo-delete/{id}")
    public ResponseEntity<StudentGetDTO> undoDelete(@PathVariable Long id) {
        return ResponseEntity.ok(service.undoDelete(id));
    }

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] content = service.generateTemplate();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=students-template.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(content);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Map<String, String>>> previewImport(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().build();

        try {
            List<Map<String, String>> preview = service.previewFromExcel(file);
            return (preview == null || preview.isEmpty())
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.ok(preview);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentService.ImportResult> importStudents(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().build();

        try {
            StudentService.ImportResult result = service.importFromExcel(file);

            if (result.created().isEmpty() && result.errors().isEmpty())
                return ResponseEntity.noContent().build();

            HttpStatus status = result.created().isEmpty()
                    ? HttpStatus.UNPROCESSABLE_ENTITY
                    : HttpStatus.CREATED;

            return ResponseEntity.status(status).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportStudents(@RequestParam(required = false) Map<String, String> filters) {
        try {
            List<StudentGetDTO> students = (filters != null && !filters.isEmpty())
                    ? service.findAllFiltered(filters)
                    : service.findAll(null, null).content();
            byte[] content = service.exportToExcel(students);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=students-export.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(content);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
