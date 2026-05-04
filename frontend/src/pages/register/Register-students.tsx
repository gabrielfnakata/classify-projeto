import { useState } from "react";
import { FormField } from "@/components/common/form-field";
import { SelectField } from "@/components/common/select-field";
import { Input } from "@/components/ui/input";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import { colors } from "@/styles/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "Alunos" | "Funcionários" | "Salas" | "Disciplinas";

const tabs: Tab[] = ["Alunos", "Funcionários", "Salas", "Disciplinas"];

const serieOptions = [
  { label: "1º Ano", value: "1" },
  { label: "2º Ano", value: "2" },
  { label: "3º Ano", value: "3" },
  { label: "4º Ano", value: "4" },
  { label: "5º Ano", value: "5" },
  { label: "6º Ano", value: "6" },
  { label: "7º Ano", value: "7" },
  { label: "8º Ano", value: "8" },
  { label: "9º Ano", value: "9" },
];

const indicacaoOptions = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
];

export default function CriarRegistro() {
  const [activeTab, setActiveTab] = useState<Tab>("Alunos");

  const [form, setForm] = useState({
    nomeCompleto: "",
    nomeResponsavel1: "",
    parentesco1: "",
    nomeResponsavel2: "",
    parentesco2: "",
    telefoneResponsavel1: "",
    telefoneResponsavel2: "",
    email: "",
    endereco: "",
    bairro: "",
    escola: "",
    serie: "",
    indicacao: "",
    quemIndicou: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div
      className="min-h-screen px-4 py-8 font-sans"
      style={{
        backgroundColor: colors.pageBg,
        color: colors.text,
        "--background": colors.pageBg,
        "--foreground": colors.text,
        "--primary": colors.teal,
        "--primary-foreground": colors.white,
        "--muted": colors.inputBg,
        "--muted-foreground": colors.muted,
        "--accent": colors.tealLight,
        "--accent-foreground": colors.tealDark,
        "--border": colors.inputBorder,
        "--panel-soft": colors.cardBg,
        "--card": colors.cardBg,
        "--card-foreground": colors.text,
        "--input": colors.inputBorder,
        "--ring": colors.tealShadow,
      } as React.CSSProperties}
    >
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: colors.navy }}
        >
          Criar Registro
        </h1>

        {/* Tabs */}
        <div
          className="flex rounded-2xl overflow-hidden mb-6 border gap-1 p-1"
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab
                  ? "shadow-sm"
                  : "bg-transparent hover:bg-accent hover:text-accent-foreground"
              }`}
              style={
                activeTab === tab
                  ? { backgroundColor: colors.teal, color: colors.white }
                  : { color: colors.muted }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Card */}
        <ContentCard>
          {activeTab === "Alunos" && (
            <div className="space-y-5">
              {/* Nome Completo */}
              <FormField label="Nome Completo" htmlFor="nomeCompleto">
                <Input
                  id="nomeCompleto"
                  name="nomeCompleto"
                  value={form.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Ex: Maria da Silva"
                />
              </FormField>

              {/* Responsável 1 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nome do Responsável 1"
                  htmlFor="nomeResponsavel1"
                >
                  <Input
                    id="nomeResponsavel1"
                    name="nomeResponsavel1"
                    value={form.nomeResponsavel1}
                    onChange={handleChange}
                    placeholder="Ex: Ana da Silva"
                  />
                </FormField>
                <FormField label="Parentesco" htmlFor="parentesco1">
                  <Input
                    id="parentesco1"
                    name="parentesco1"
                    value={form.parentesco1}
                    onChange={handleChange}
                    placeholder="Ex: Mãe"
                  />
                </FormField>
              </div>

              {/* Responsável 2 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nome do Responsável 2"
                  htmlFor="nomeResponsavel2"
                >
                  <Input
                    id="nomeResponsavel2"
                    name="nomeResponsavel2"
                    value={form.nomeResponsavel2}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva"
                  />
                </FormField>
                <FormField label="Parentesco" htmlFor="parentesco2">
                  <Input
                    id="parentesco2"
                    name="parentesco2"
                    value={form.parentesco2}
                    onChange={handleChange}
                    placeholder="Ex: Pai"
                  />
                </FormField>
              </div>

              {/* Telefones */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Telefone do Responsável 1"
                  htmlFor="telefoneResponsavel1"
                >
                  <Input
                    id="telefoneResponsavel1"
                    name="telefoneResponsavel1"
                    type="tel"
                    value={form.telefoneResponsavel1}
                    onChange={handleChange}
                    placeholder="Ex: (11) 91234-1234"
                  />
                </FormField>
                <FormField
                  label="Telefone do Responsável 2"
                  htmlFor="telefoneResponsavel2"
                >
                  <Input
                    id="telefoneResponsavel2"
                    name="telefoneResponsavel2"
                    type="tel"
                    value={form.telefoneResponsavel2}
                    onChange={handleChange}
                    placeholder="Ex: (11) 91234-1234"
                  />
                </FormField>
              </div>

              {/* E-mail */}
              <FormField label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ex: ana@email.com"
                />
              </FormField>

              {/* Endereço e Bairro */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Endereço" htmlFor="endereco">
                  <Input
                    id="endereco"
                    name="endereco"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Ex: Rua Pedro Vicente, 123 - Ap 101"
                  />
                </FormField>
                <FormField label="Bairro" htmlFor="bairro">
                  <Input
                    id="bairro"
                    name="bairro"
                    value={form.bairro}
                    onChange={handleChange}
                    placeholder="Ex: Canindé"
                  />
                </FormField>
              </div>

              {/* Escola e Série */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Escola" htmlFor="escola">
                  <Input
                    id="escola"
                    name="escola"
                    value={form.escola}
                    onChange={handleChange}
                    placeholder="Ex: Colégio Aprender Mais"
                  />
                </FormField>
                <FormField label="Série" htmlFor="serie">
                  <SelectField
                    value={form.serie}
                    onChange={(value) =>
                      handleSelectChange("serie", value)
                    }
                    options={serieOptions}
                    placeholder="Escolha uma série"
                  />
                </FormField>
              </div>

              {/* Indicação */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Indicação" htmlFor="indicacao">
                  <SelectField
                    value={form.indicacao}
                    onChange={(value) =>
                      handleSelectChange("indicacao", value)
                    }
                    options={indicacaoOptions}
                    placeholder="Escolha uma opção"
                  />
                </FormField>
                <FormField
                  label="Se sim, quem indicou"
                  htmlFor="quemIndicou"
                >
                  <Input
                    id="quemIndicou"
                    name="quemIndicou"
                    value={form.quemIndicou}
                    onChange={handleChange}
                    placeholder="Ex: Carolina Santos (Amiga)"
                    disabled={form.indicacao !== "sim"}
                  />
                </FormField>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button type="submit">Enviar</Button>
              </div>
            </div>
          )}

          {activeTab !== "Alunos" && (
            <div className="flex items-center justify-center h-48 text-sm font-medium text-muted-foreground">
              Formulário de <span className="font-bold mx-1">{activeTab}</span> em
              breve...
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
