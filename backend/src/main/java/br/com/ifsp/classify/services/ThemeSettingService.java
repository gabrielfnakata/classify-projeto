package br.com.ifsp.classify.services;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.get.ThemeSettingGetDTO;
import br.com.ifsp.classify.dtos.update.ThemeSettingUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.ThemeSetting;
import br.com.ifsp.classify.models.enums.ThemeAccent;
import br.com.ifsp.classify.models.enums.ThemeMode;
import br.com.ifsp.classify.repositories.ThemeSettingRepository;

@Service
public class ThemeSettingService {

    private static final int SETTING_ID = 1;

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

        ThemeMode mode = ThemeMode.fromString(dto.colorMode());
        if (mode == null)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "O modo deve ser um destes: " + options(ThemeMode.values()) + ".");

        ThemeAccent accent = ThemeAccent.fromString(dto.accent());
        if (accent == null)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "A cor de destaque deve ser uma destas: " + options(ThemeAccent.values()) + ".");

        ThemeSetting setting = getSetting();
        setting.setColorMode(mode.value());
        setting.setAccent(accent.value());

        return returnDTO(repository.save(setting));
    }

    private static <E extends Enum<E>> String options(E[] values) {
        return Arrays.stream(values)
                .map(value -> value.name().toLowerCase())
                .collect(Collectors.joining(", "));
    }
}
