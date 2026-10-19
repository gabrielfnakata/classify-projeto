package br.com.ifsp.classify.services;

import br.com.ifsp.classify.utils.Utils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String LOGO_PATH = "mail/classify-logo.png";
    private static final String LOGO_CONTENT_ID = "classifyLogo";

    public static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final Set<String> LOWERCASE_WORDS = Set.of("de", "da", "do", "das", "dos", "e");

    private final JavaMailSender mailSender;
    private final String senderAddress;
    private final String appUrl;
    private final Map<String, String> templates = new ConcurrentHashMap<>();

    public MailService(JavaMailSender mailSender, @Value("${spring.mail.username:}") String senderAddress,
            @Value("${classify.app-url}") String appUrl) {
        this.mailSender = mailSender;
        this.senderAddress = senderAddress;
        this.appUrl = appUrl.endsWith("/") ? appUrl.substring(0, appUrl.length() - 1) : appUrl;
    }

    public String appUrl() {
        return appUrl;
    }

    public boolean isConfigured() {
        return !Utils.isNullOrEmpty(senderAddress);
    }

    public boolean send(Message message) {
        if (!isConfigured()) {
            log.warn("E-mail \"{}\" não enviado: conta de envio não configurada (MAIL_USERNAME).", message.subject());
            return false;
        }

        try {
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mail, true, StandardCharsets.UTF_8.name());
            helper.setFrom(senderAddress, "Classify");
            helper.setTo(message.to().toLowerCase());
            if (message.cc() != null && !message.cc().isEmpty())
                helper.setCc(message.cc().stream().map(String::toLowerCase).toArray(String[]::new));
            if (!Utils.isNullOrEmpty(message.replyTo()))
                helper.setReplyTo(message.replyTo().toLowerCase(), message.replyToName());
            helper.setSubject("[Classify] " + message.subject());
            helper.setText(message.text(), render(message.template(), message.values()));
            helper.addInline(LOGO_CONTENT_ID, new ClassPathResource(LOGO_PATH), "image/png");

            mailSender.send(mail);
            log.info("E-mail \"{}\" enviado para {}.", message.subject(), message.to().toLowerCase());
            return true;
        } catch (MailException | MessagingException | UnsupportedEncodingException ex) {
            log.warn("Falha ao enviar o e-mail \"{}\" para {}: {}", message.subject(), message.to(), ex.getMessage());
            return false;
        }
    }

    public record Message(String to, java.util.List<String> cc, String replyTo, String replyToName, String subject,
                          String text, String template, Map<String, String> values) {
    }

    private String render(String templatePath, Map<String, String> values) {
        String html = templates.computeIfAbsent(templatePath, MailService::loadTemplate);
        for (Map.Entry<String, String> entry : values.entrySet())
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        return html;
    }

    private static String loadTemplate(String path) {
        try {
            return StreamUtils.copyToString(new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException("Template de e-mail não encontrado: " + path, ex);
        }
    }


    public static String escape(String value) {
        if (value == null)
            return "";

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    public static String titleCase(String value) {
        if (Utils.isNullOrEmpty(value))
            return "";

        String[] words = value.trim().toLowerCase(PT_BR).split("\\s+");
        for (int i = 0; i < words.length; i++) {
            if (i == 0 || !LOWERCASE_WORDS.contains(words[i]))
                words[i] = capitalize(words[i]);
        }
        return String.join(" ", words);
    }

    public static String capitalize(String value) {
        return (value == null || value.isEmpty()) ? "" : value.substring(0, 1).toUpperCase(PT_BR) + value.substring(1);
    }

    public static String firstName(String name) {
        return (name == null || name.isEmpty()) ? "" : name.split(" ")[0];
    }

    public static String initials(String name) {
        return Arrays.stream(name.split(" "))
                .filter(word -> !word.isEmpty() && !LOWERCASE_WORDS.contains(word))
                .limit(2)
                .map(word -> word.substring(0, 1).toUpperCase(PT_BR))
                .collect(Collectors.joining());
    }
}
