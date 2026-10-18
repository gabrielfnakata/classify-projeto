package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.TeacherAvailabilityCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.TeacherAvailabilityGetDTO;
import br.com.ifsp.classify.dtos.get.ProfileGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.dtos.update.PasswordUpdateDTO;
import br.com.ifsp.classify.dtos.update.ProfileUpdateDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.TeacherAvailabilityService;
import org.springframework.http.HttpStatus;
import br.com.ifsp.classify.services.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/employee", produces = MediaType.APPLICATION_JSON_VALUE)
public class EmployeeController extends AbstractController<EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO> {

    private static final String EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final EmployeeService service;
    private final UserService userService;
    private final TeacherAvailabilityService availabilityService;

    public EmployeeController(EmployeeService service, UserService userService, TeacherAvailabilityService availabilityService) {
        super(service);
        this.service = service;
        this.userService = userService;
        this.availabilityService = availabilityService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileGetDTO> getProfile(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(service.getProfile(user.username()));
    }

    @PutMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProfileGetDTO> updateProfile(Authentication authentication,
                                                       @RequestBody ProfileUpdateDTO profile) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(service.updateProfile(user.username(), profile));
    }

    @PutMapping(value = "/me/password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> changePassword(Authentication authentication,
                                               @RequestBody PasswordUpdateDTO password) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        userService.changePassword(user.username(), password);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{uuid}/availability")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> listAvailability(@PathVariable String uuid) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.listByEmployee(uuid);

        return blocks.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(blocks);
    }

    @PostMapping("/{uuid}/availability")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> addAvailability(
            @PathVariable String uuid, @RequestBody TeacherAvailabilityCreateDTO body) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.add(uuid, body);

        return (blocks == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.status(HttpStatus.CREATED).body(blocks);
    }

    @DeleteMapping("/{uuid}/availability/{availabilityUuid}")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> removeAvailability(
            @PathVariable String uuid, @PathVariable String availabilityUuid) {
        return ResponseEntity.ok(availabilityService.remove(uuid, availabilityUuid));
    }

    @GetMapping(value = "/template", produces = EXCEL_MEDIA_TYPE)
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            return excelResponse(service.generateTemplate(), "employees-template.xlsx");
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
    public ResponseEntity<EmployeeService.ImportResult> importEmployees(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().build();

        try {
            EmployeeService.ImportResult result = service.importFromExcel(file);

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

    @GetMapping(value = "/export", produces = EXCEL_MEDIA_TYPE)
    public ResponseEntity<byte[]> exportEmployees(@RequestParam(required = false) Map<String, String> filters) {
        try {
            List<EmployeeGetDTO> employees = (filters != null && !filters.isEmpty())
                    ? service.findAllFiltered(filters)
                    : service.findAll();

            return excelResponse(service.exportToExcel(employees), "employees-export.xlsx");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private ResponseEntity<byte[]> excelResponse(byte[] content, String filename) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(EXCEL_MEDIA_TYPE))
                .body(content);
    }
}
