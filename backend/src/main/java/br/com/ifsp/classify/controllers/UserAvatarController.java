package br.com.ifsp.classify.controllers;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.ifsp.classify.dtos.get.AvatarGetDTO;
import br.com.ifsp.classify.dtos.update.AvatarPresetUpdateDTO;
import br.com.ifsp.classify.models.UserAvatar;
import br.com.ifsp.classify.services.UserAvatarService;

@RestController
@RequestMapping("/user/me/avatar")
public class UserAvatarController {

    private final UserAvatarService service;

    public UserAvatarController(UserAvatarService service) {
        this.service = service;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AvatarGetDTO> getAvatar(Authentication authentication) {
        return ResponseEntity.ok(service.getAvatar(authentication.getName()));
    }

    @GetMapping("/photo")
    public ResponseEntity<byte[]> getPhoto(Authentication authentication) {
        UserAvatar avatar = service.getPhoto(authentication.getName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(avatar.getContentType()))
                .cacheControl(CacheControl.noCache())
                .body(avatar.getData());
    }

    @PutMapping(value = "/preset", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AvatarGetDTO> choosePreset(Authentication authentication,
                                                     @RequestBody AvatarPresetUpdateDTO body) {
        return ResponseEntity.ok(service.choosePreset(authentication.getName(), body != null ? body.preset() : null));
    }

    @PutMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AvatarGetDTO> uploadPhoto(Authentication authentication,
                                                    @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadPhoto(authentication.getName(), file));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeAvatar(Authentication authentication) {
        service.removeAvatar(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
