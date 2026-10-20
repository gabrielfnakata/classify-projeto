export interface RegistrationNotice {
  kind: "success" | "warning";
  text: string;
}

export function welcomeEmailNotice(name: string, email: string | null | undefined, sent: boolean | null | undefined): RegistrationNotice {
  if (sent === true)
    return {
      kind: "success",
      text: `${name} foi cadastrado(a). Enviamos um e-mail para ${email?.toLowerCase()} com as instruções de primeiro acesso.`,
    };

  if (sent === false)
    return {
      kind: "warning",
      text: `${name} foi cadastrado(a), mas não foi possível enviar o e-mail de primeiro acesso para ${email?.toLowerCase()}. `
        + `A pessoa ainda pode criar a senha em "Primeiro acesso", na tela de login.`,
    };

  return { kind: "success", text: `${name} foi cadastrado(a).` };
}
