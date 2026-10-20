package br.com.ifsp.classify.services;

import static br.com.ifsp.classify.services.MailService.escape;
import static br.com.ifsp.classify.services.MailService.firstName;
import static br.com.ifsp.classify.services.MailService.titleCase;

import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.security.UserRole;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WelcomeMailService {

    private static final String TEMPLATE = "mail/welcome.html";

    private final MailService mailService;

    public WelcomeMailService(MailService mailService) {
        this.mailService = mailService;
    }

    public Boolean sendIfPendingFirstAccess(User user, String personName) {
        if (user == null || user.hasPassword())
            return null;

        String appUrl = mailService.appUrl();
        String name = titleCase(personName);
        String email = user.getEmail().toLowerCase();
        String roleLabel = roleLabel(user);
        String firstAccessUrl = appUrl + "/first-access?email=" + MailService.urlEncode(email);

        Map<String, String> values = Map.of(
                "firstName", escape(firstName(name)),
                "roleLabel", escape(roleLabel),
                "email", escape(email),
                "appUrl", escape(appUrl),
                "firstAccessUrl", escape(firstAccessUrl)
        );

        String text = "Bem-vindo(a) ao Classify, " + firstName(name) + "!\n\n"
                + "A escola criou o seu cadastro como " + roleLabel + ".\n"
                + "Seu e-mail de acesso: " + email + "\n\n"
                + "Para criar sua senha:\n"
                + "1. Acesse " + appUrl + "\n"
                + "2. Na tela de login, clique em \"Primeiro acesso\" e informe o e-mail acima.\n"
                + "3. Crie sua senha (ao menos 8 caracteres, com letra maiúscula, letra minúscula e número).\n\n"
                + "Se não reconhece este cadastro, ignore esta mensagem.";

        return mailService.send(new MailService.Message(
                email, null, null, null, "Seu cadastro no Classify está pronto", text, TEMPLATE, values));
    }

    private static String roleLabel(User user) {
        String roleId = (user.getRole() != null) ? user.getRole().getId() : "";
        return UserRole.fromId(roleId)
                .map(role -> switch (role) {
                    case ADMIN -> "administrador(a)";
                    case PROFESSOR -> "professor(a)";
                    case ESTUDANTE -> "aluno(a)";
                })
                .orElse("usuário(a)");
    }
}
