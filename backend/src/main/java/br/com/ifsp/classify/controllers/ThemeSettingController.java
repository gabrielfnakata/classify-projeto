package br.com.ifsp.classify.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.ifsp.classify.dtos.get.ThemeSettingGetDTO;
import br.com.ifsp.classify.dtos.update.ThemeSettingUpdateDTO;
import br.com.ifsp.classify.services.ThemeSettingService;

@RestController
@RequestMapping(value = "/user/default-theme", produces = MediaType.APPLICATION_JSON_VALUE)
public class ThemeSettingController {

    private final ThemeSettingService service;

    public ThemeSettingController(ThemeSettingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ThemeSettingGetDTO> get() {
        return ResponseEntity.ok(service.get());
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ThemeSettingGetDTO> update(@RequestBody ThemeSettingUpdateDTO body) {
        return ResponseEntity.ok(service.update(body));
    }
}
