package br.com.ifsp.classify.controllers;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.ifsp.classify.dtos.get.GradeGetDTO;

@RestController
@RequestMapping(value = "/grade", produces = MediaType.APPLICATION_JSON_VALUE)
public class GradeController {

    private static final List<GradeGetDTO> GRADES = List.of(
            new GradeGetDTO(1, "1º Ano"),
            new GradeGetDTO(2, "2º Ano"),
            new GradeGetDTO(3, "3º Ano"),
            new GradeGetDTO(4, "4º Ano"),
            new GradeGetDTO(5, "5º Ano"),
            new GradeGetDTO(6, "6º Ano"),
            new GradeGetDTO(7, "7º Ano"),
            new GradeGetDTO(8, "8º Ano"),
            new GradeGetDTO(9, "9º Ano")
    );

    @GetMapping
    public ResponseEntity<List<GradeGetDTO>> getAll() {
        return ResponseEntity.ok(GRADES);
    }
}