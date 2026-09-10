package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AttendanceBulkSaveDTO;
import br.com.ifsp.classify.dtos.create.AttendanceCreateDTO;
import br.com.ifsp.classify.dtos.get.AttendanceGetDTO;
import br.com.ifsp.classify.dtos.get.AttendanceRosterEntryDTO;
import br.com.ifsp.classify.dtos.get.AttendanceSessionStatusDTO;
import br.com.ifsp.classify.dtos.update.AttendanceUpdateDTO;
import br.com.ifsp.classify.services.AttendanceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/attendance", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class AttendanceController extends AbstractController<AttendanceCreateDTO, AttendanceGetDTO, AttendanceUpdateDTO> {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/status")
    public ResponseEntity<List<AttendanceSessionStatusDTO>> getStatusForAllSessions() {
        return ResponseEntity.ok(service.getStatusForAllSessions());
    }

    @GetMapping("/session/{sessionUuid}")
    public ResponseEntity<List<AttendanceRosterEntryDTO>> getRosterForSession(@PathVariable String sessionUuid) {
        List<AttendanceRosterEntryDTO> roster = service.getRosterForSession(sessionUuid);

        return (roster == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(roster);
    }

    @PutMapping("/session/{sessionUuid}")
    public ResponseEntity<List<AttendanceGetDTO>> saveAttendanceForSession(
            @PathVariable String sessionUuid, @RequestBody AttendanceBulkSaveDTO body) {
        List<AttendanceGetDTO> saved = service.bulkSaveForSession(sessionUuid, body);

        return (saved == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(saved);
    }
}
