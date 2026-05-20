import { useFormContext } from "react-hook-form"
import { FormInput } from "../../components/form/formInput"
import type { ProjectFormValues } from "../../schemas/projectFormSchema"

export function ProjectFormFields() {
  const { control } = useFormContext<ProjectFormValues>()

  return (
    <>
      <FormInput name="name" control={control} label="Name" placeholder="Name" />
      <FormInput
        name="description"
        control={control}
        label="Description"
        placeholder="Description"
      />
    </>
  )
}
