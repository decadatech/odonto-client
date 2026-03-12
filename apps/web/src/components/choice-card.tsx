import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"

export interface ChoiceCardOption {
  value: string
  title: string
  description: string
}

interface ChoiceCardProps {
  name: string
  value?: string
  onValueChange?: (value: string) => void
  options: ChoiceCardOption[]
  className?: string
}

export function ChoiceCard({
  name,
  value,
  onValueChange,
  options,
  className,
}: ChoiceCardProps) {
  return (
    <>
      <RadioGroup value={value} onValueChange={onValueChange} className={className}>
        {options.map((option) => {
          const inputId = `${name}-${option.value}`

          return (
            <FieldLabel key={option.value} htmlFor={inputId}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{option.title}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={option.value} id={inputId} />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>
      <input type="hidden" name={name} value={value ?? ""} />
    </>
  )
}
