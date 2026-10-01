package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.services.EmployeeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/employee", produces = MediaType.APPLICATION_JSON_VALUE)
public class EmployeeController extends AbstractController<EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO> {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        super(service);
        this.service = service;
    }

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] content = service.generateTemplate();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=employees-template.xlsx")
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

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportEmployees(@RequestParam(required = false) Map<String, String> filters) {
        try {
            List<EmployeeGetDTO> employees = (filters != null && !filters.isEmpty())
                    ? service.findAllFiltered(filters)
                    : service.findAll();
            byte[] content = service.exportToExcel(employees);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=employees-export.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(content);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
