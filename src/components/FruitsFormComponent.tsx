import { useState } from "react";
import type { ItemListagemProps } from "./ItemListagem";
import { Button } from "./ui/button";
import { Field, FieldLabel, FieldDescription, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import Listagem from "./Listagem";

const AddFruitForm = {
  name: "name",
  quantity: "quantity",
} as const;

type AddFruitForm = typeof AddFruitForm;

function FruitsFormComponent() {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AddFruitForm>();

  const [fruits, setFruta] = useState<ItemListagemProps<number>[]>([]);

  const addFruit = (value: AddFruitForm) => {
    const newFruit = {
      label: value.name,
      value: fruits.length + 1,
      clicked: alert,
    };

    setFruta([...fruits, newFruit]);

    reset();
    setFocus(AddFruitForm.name);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(addFruit)}
        className="inline-flex items-center gap-2"
      >
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            {...register(AddFruitForm.name, { required: "Name is required!" })}
          />
          {!errors.name && (
            <FieldDescription>
              Choose a cool name for your fruit.
            </FieldDescription>
          )}

          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>
        <Button type="submit">Add fruit</Button>
      </form>
      <Listagem items={fruits} />
    </div>
  );
}

export default FruitsFormComponent;
