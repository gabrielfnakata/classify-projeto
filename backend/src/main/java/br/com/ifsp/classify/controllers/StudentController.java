package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.get.GuardianGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.update.GuardianUpdateDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.services.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/student", produces = MediaType.APPLICATION_JSON_VALUE)
public class StudentController extends AbstractController<StudentCreateDTO, StudentGetDTO, StudentUpdateDTO> {

    private final StudentService service;

    public StudentController(StudentService service) {
        super(service);
        this.service = service;
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
                    : service.findAll();
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
