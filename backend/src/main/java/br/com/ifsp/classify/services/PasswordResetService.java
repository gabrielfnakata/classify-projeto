package br.com.ifsp.classify.services;

import static br.com.ifsp.classify.services.MailService.escape;
import static br.com.ifsp.classify.services.MailService.firstName;
import static br.com.ifsp.classify.services.MailService.titleCase;

import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.JwtService;
import br.com.ifsp.classify.specifications.UserSpecification;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;

@Service
public class PasswordResetService {

    private static final String TEMPLATE = "mail/password-reset.html";
    private static final String INVALID_LINK_MESSAGE =
            "Este link de redefinição é inválido, expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".";

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final MailService mailService;

    public PasswordResetService(UserRepository userRepository, UserService userService, JwtService jwtService, MailService mailService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    public void requestReset(String email) {
        if (Utils.isNullOrEmpty(email))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Informe o e-mail cadastrado.");

        if (!mailService.isConfigured())
            throw new DtoException(ExceptionCode.INTERNAL_ERROR,
                    "O envio de e-mails não está configurado. Avise a secretaria.");

        User user = userRepository.findOne(UserSpecification.getByEmail(Utils.trimAndUpper(email))).orElse(null);
        if (user == null)
            return;

        String token = jwtService.generatePasswordResetToken(user.getEmail(), fingerprint(user.getPassword()));
        String resetUrl = mailService.appUrl() + "/reset-password?token=" + MailService.urlEncode(token);
        String name = titleCase(personName(user));
        String minutes = String.valueOf(jwtService.getPasswordResetExpirationMinutes());

        Map<String, String> values = Map.of(
                "firstName", escape(firstName(name)),
                "email", escape(user.getEmail().toLowerCase()),
                "resetUrl", escape(resetUrl),
                "minutes", escape(minutes)
        );

        String text = "Olá, " + firstName(name) + "!\n\n"
                + "Recebemos um pedido para redefinir a senha da sua conta no Classify (" + user.getEmail().toLowerCase() + ").\n\n"
                + "Para criar uma nova senha, acesse o link abaixo (válido por " + minutes + " minutos):\n"
                + resetUrl + "\n\n"
                + "Se não foi você, ignore este e-mail: sua senha continua a mesma.";

        mailService.send(new MailService.Message(
                user.getEmail(), null, null, null, "Redefinição de senha", text, TEMPLATE, values));
    }

    public User resetPassword(String token, String password, String confirmPassword) {
        JwtService.PasswordResetClaims claims = Utils.isNullOrEmpty(token)
                ? null
                : jwtService.parsePasswordResetToken(token).orElse(null);
        if (claims == null)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, INVALID_LINK_MESSAGE);

        User user = userRepository.findOne(UserSpecification.getByEmail(claims.email())).orElse(null);
        if (user == null || !fingerprint(user.getPassword()).equals(claims.passwordFingerprint()))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, INVALID_LINK_MESSAGE);

        return userService.applyNewPassword(user, password, confirmPassword);
    }

    private static String personName(User user) {
        if (user.getEmployee() != null)
            return user.getEmployee().getName();
        if (user.getStudent() != null)
            return user.getStudent().getName();
        return "";
    }

    private static String fingerprint(String passwordHash) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest((passwordHash == null ? "" : passwordHash).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest).substring(0, 16);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
