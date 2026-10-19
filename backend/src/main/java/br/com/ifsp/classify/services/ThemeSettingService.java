package br.com.ifsp.classify.services;

import java.util.Set;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.get.ThemeSettingGetDTO;
import br.com.ifsp.classify.dtos.update.ThemeSettingUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.ThemeSetting;
import br.com.ifsp.classify.repositories.ThemeSettingRepository;

@Service
public class ThemeSettingService {

    private static final int SETTING_ID = 1;
    private static final Set<String> COLOR_MODES = Set.of("light", "dark", "system");
    private static final Set<String> ACCENTS = Set.of("blue", "green", "red", "purple", "orange", "gray");

    private final ThemeSettingRepository repository;

    public ThemeSettingService(ThemeSettingRepository repository) {
        this.repository = repository;
    }

    private ThemeSettingGetDTO returnDTO(ThemeSetting setting) {
        return new ThemeSettingGetDTO(setting.getColorMode(), setting.getAccent());
    }

    private ThemeSetting getSetting() {
        return repository.findById(SETTING_ID)
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O tema padrão não foi encontrado."));
    }

    public ThemeSettingGetDTO get() {
        return returnDTO(getSetting());
    }

    public ThemeSettingGetDTO update(ThemeSettingUpdateDTO dto) {
        if (dto == null || dto.colorMode() == null || dto.accent() == null)
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o modo e a cor de destaque.");

        if (!COLOR_MODES.contains(dto.colorMode()))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "O modo deve ser light, dark ou system.");

        if (!ACCENTS.contains(dto.accent()))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "A cor de destaque informada não existe.");

        ThemeSetting setting = getSetting();
        setting.setColorMode(dto.colorMode());
        setting.setAccent(dto.accent());

        return returnDTO(repository.save(setting));
    }
}
