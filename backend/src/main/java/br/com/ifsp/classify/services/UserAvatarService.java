package br.com.ifsp.classify.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.ifsp.classify.dtos.get.AvatarGetDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.models.UserAvatar;
import br.com.ifsp.classify.repositories.UserAvatarRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.specifications.UserSpecification;
import br.com.ifsp.classify.utils.Utils;

@Service
public class UserAvatarService {

    private static final Pattern PRESET_PATTERN = Pattern.compile("^avatar-(0[1-9]|1[0-2])$");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_PHOTO_SIZE = 1024 * 1024;

    private final UserAvatarRepository avatarRepository;
    private final UserRepository userRepository;

    public UserAvatarService(UserAvatarRepository avatarRepository, UserRepository userRepository) {
        this.avatarRepository = avatarRepository;
        this.userRepository = userRepository;
    }

    private AvatarGetDTO returnDTO(UserAvatar avatar) {
        if (avatar == null)
            return new AvatarGetDTO(null, false, null);

        return new AvatarGetDTO(avatar.getPreset(), avatar.getData() != null, avatar.getUpdatedAt());
    }

    private UserAvatar getOrCreate(String email) {
        return avatarRepository.findByUserEmail(email).orElseGet(() -> {
            User user = userRepository.findOne(UserSpecification.getByEmail(email))
                    .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Usuário não encontrado."));

            UserAvatar avatar = new UserAvatar();
            avatar.setUser(user);
            return avatar;
        });
    }

    @Transactional(readOnly = true)
    public AvatarGetDTO getAvatar(String email) {
        return returnDTO(avatarRepository.findByUserEmail(email).orElse(null));
    }

    @Transactional(readOnly = true)
    public UserAvatar getPhoto(String email) {
        UserAvatar avatar = avatarRepository.findByUserEmail(email).orElse(null);

        if (avatar == null || avatar.getData() == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O usuário não possui foto de perfil.");

        return avatar;
    }

    @Transactional
    public AvatarGetDTO choosePreset(String email, String preset) {
        if (Utils.isNullOrEmpty(preset) || !PRESET_PATTERN.matcher(preset).matches())
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "O avatar escolhido é inválido.");

        UserAvatar avatar = getOrCreate(email);
        avatar.setPreset(preset);
        avatar.setContentType(null);
        avatar.setData(null);
        avatar.setUpdatedAt(LocalDateTime.now());

        return returnDTO(avatarRepository.save(avatar));
    }

    @Transactional
    public AvatarGetDTO uploadPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Nenhuma imagem foi enviada.");

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType()))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "A foto deve estar no formato PNG, JPEG ou WEBP.");

        if (file.getSize() > MAX_PHOTO_SIZE)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "A foto deve ter no máximo 1 MB.");

        UserAvatar avatar = getOrCreate(email);
        try {
            avatar.setData(file.getBytes());
        } catch (IOException ex) {
            throw new DtoException(ExceptionCode.INTERNAL_ERROR, "Não foi possível ler a imagem enviada.");
        }
        avatar.setContentType(file.getContentType());
        avatar.setPreset(null);
        avatar.setUpdatedAt(LocalDateTime.now());

        return returnDTO(avatarRepository.save(avatar));
    }

    @Transactional
    public void removeAvatar(String email) {
        avatarRepository.findByUserEmail(email).ifPresent(avatarRepository::delete);
    }
}
