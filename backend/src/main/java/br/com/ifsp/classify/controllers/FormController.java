package br.com.ifsp.classify.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/form", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class FormController {
    /* TODO:
     - Endpoint pra criar formulário
        - haverá suporte a rascunho?
     - Endpoint pra enviar formulário para alunos
     - Endpoint pra listar formulários de um professor para ele mesmo ou de um professor para seus alunos
        - Suporte à filtros e paginação
     - Endpoint pra trazer as questões (junto de respostas, se já houverem, no caso de um aluno) de um formulário
     - Endpoint pra demarcar o início de uma tentativa de formulário
        - haverá suporte a rascunho?
     - Endpoint pra enviar uma tentativa do formulário
     - Endpoint pra professor corrigir formulário
     */
}
