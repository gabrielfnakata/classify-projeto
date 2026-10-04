import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Download} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import {useState} from "react";


export default function DefineFormTypeDialog() {
    const { isSubmitting, isValid, setFieldValue, submitForm } = useFormikContext<FormCreateDTO>();
    const [open, setOpen] = useState(false);

    const handleFormTypeSelection = (hasScore: boolean) => {
        setFieldValue("hasScore", hasScore);
        submitForm().then(() => setOpen(false));
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
              disabled={!isValid || isSubmitting}
          >
              <Button
                  className={"h-10 px-5 rounded-xl text-sm font-semibold hover:cursor-pointer hover:bg-button-highlight"}
                  disabled={!isValid || isSubmitting}
                  onClick={() => {}}
              >
                  <Download /> Salvar Formulário
              </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
              <DialogHeader>
                  <DialogTitle>Deseja salvar o formulário?</DialogTitle>
                  <DialogDescription>
                      Se sim, prossiga selecionando se o formulário deverá ser avaliativo. Ao cancelar,
                      nenhum dado será salvo e você poderá continuar editando o formulário.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end">
                  <DialogClose asChild>
                      <Button
                          className="rounded-xl text-sm font-semibold bg-destructive
                          hover:cursor-pointer hover:text-destructive hover:bg-white transition-colors duration-250"
                      >
                          Cancelar
                      </Button>
                  </DialogClose>
                  <Button
                      className="rounded-xl text-sm font-semibold
                      hover:cursor-pointer transition-colors duration-200"
                      variant="secondary"
                      onClick={() => handleFormTypeSelection(false)}
                  >
                    Salvar como Não Avaliativo
                  </Button>
                  <Button
                      className="rounded-xl text-sm font-semibold
                      hover:cursor-pointer hover:bg-button-highlight transition-colors duration-200"
                      onClick={() => handleFormTypeSelection(true)}
                  >
                    Salvar como Avaliativo
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}
