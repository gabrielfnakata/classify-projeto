package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.BatchResultDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionSummaryDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionBatchDeleteDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionBatchStatusDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionStatusUpdateDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.services.ClassSessionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(value = "/classsession", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class ClassSessionController extends AbstractController<ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO> {

    private final ClassSessionService service;

    public ClassSessionController(ClassSessionService service) {
        super(service);
        this.service = service;
    }

    @PutMapping("/{uuid}/status")
    public ResponseEntity<ClassSessionGetDTO> changeStatus(
            @PathVariable String uuid, @RequestBody ClassSessionStatusUpdateDTO body) {
        ClassSessionGetDTO session = service.changeStatus(uuid, body);

        return (session == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(session);
    }

    /** Cancela ou reativa várias aulas de uma vez (uma recorrência inteira, por exemplo). */
    @PutMapping("/status/batch")
    public ResponseEntity<BatchResultDTO> changeStatusBatch(@RequestBody ClassSessionBatchStatusDTO body) {
        BatchResultDTO result = service.changeStatusBatch(body);

        return (result == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(result);
    }

    /** Exclui várias aulas de uma vez. POST porque DELETE com corpo tem suporte irregular. */
    @PostMapping("/delete/batch")
    public ResponseEntity<BatchResultDTO> deleteBatch(@RequestBody ClassSessionBatchDeleteDTO body) {
        BatchResultDTO result = service.deleteBatch(body);

        return (result == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(result);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<ClassSessionSummaryDTO>> summary(@RequestParam String groupBy) {
        List<ClassSessionSummaryDTO> summary = service.summary(groupBy);

        return summary.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(summary);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ClassSessionGetDTO>> filter(
            @RequestParam(required = false) String studentUuid,
            @RequestParam(required = false) String employeeUuid,
            @RequestParam(required = false) String classroomUuid,
            @RequestParam(required = false) String subjectUuid,
            @RequestParam(required = false) String classUuid,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        List<ClassSessionGetDTO> sessions = service.filter(studentUuid, employeeUuid, classroomUuid, subjectUuid, classUuid, from, to);

        return sessions.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(sessions);
    }
}
