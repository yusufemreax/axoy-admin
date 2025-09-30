"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ProductType } from "./columns"
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddProductTypeForm({
  editing,
  setEditing,
  open,
  setOpen,
  mutate,
}: {
  editing: ProductType | null
  setEditing: (value: ProductType | null) => void
  open: boolean
  setOpen: (value: boolean) => void
  mutate: () => void
}) {
  const form = useForm<{
    name: string
    fields: { key: string; label: string; inputType: string; optionsStr?: string }[]
  }>({
    defaultValues: { name: "", fields: [{ key: "", label: "", inputType: "text", optionsStr: "" }] },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  })

  useEffect(() => {
    if (editing) {
      const convertedFields = editing.fields.map((f) => ({
        ...f,
        optionsStr: f.options?.join(", "),
      }))
      form.reset({ ...editing, fields: convertedFields })
    } else {
      form.reset({
        name: "",
        fields: [{ key: "", label: "", inputType: "text", optionsStr: "" }],
      })
    }
  }, [editing, form])

  // Kaydetme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values.fields = values.fields.map((f: any) => {
      if (f.inputType === "select") {
        return {
          key: f.key,
          label: f.label,
          inputType: f.inputType,
          options: f.optionsStr
            ? f.optionsStr.split(",").map((o: string) => o.trim())
            : [],
        }
      }
      return {
        key: f.key,
        label: f.label,
        inputType: f.inputType,
      }
    })

    if (editing && editing._id) {
      await fetch(`/api/product-types/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    } else {
      await fetch("/api/product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    }

    form.reset({ name: "", fields: [{ key: "", label: "", inputType: "text" }] })
    setEditing(null)
    setOpen(false)
    mutate()
  }

  // Drawer kapanınca reset
  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    form.reset({
      name: "",
      fields: [{ key: "", label: "", inputType: "text", optionsStr: "" }],
    })
  }

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Tipi Düzenle" : "Yeni Tip Ekle"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tip Adı</label>
            <Input {...form.register("name", { required: true })} placeholder="ör: amfi" />
          </div>

          <h3 className="font-semibold">Alanlar</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 border p-3 rounded-md mb-2">
              <Input {...form.register(`fields.${index}.key`, { required: true })} placeholder="key (ör: kanalSayisi)" />
              <Input {...form.register(`fields.${index}.label`, { required: true })} placeholder="Etiket (ör: Kanal Sayısı)" />
              <Select
                onValueChange={(val) => form.setValue(`fields.${index}.inputType`, val)}
                defaultValue={form.watch(`fields.${index}.inputType`)}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Input Tipi Seç" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                </SelectContent>
                </Select>
              {form.watch(`fields.${index}.inputType`) === "select" && (
                <Input {...form.register(`fields.${index}.optionsStr`)} placeholder="Seçenekler (virgülle ayır: ör: 2 kanal,4 kanal,6 kanal)" />
              )}

              <Button type="button" variant="destructive" onClick={() => remove(index)} className="w-full">
                Kaldır
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={() => append({ key: "", label: "", inputType: "text" })}>
            + Alan Ekle
          </Button>

          <Button type="submit" className="w-full mt-4">
            {editing ? "Güncelle" : "Kaydet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
