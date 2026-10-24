"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldConfig<T extends object> = {
  key: keyof T & string;
  label: string;
  multiline?: boolean;
  image?: boolean;
  hint?: string;
};

function canPreview(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  return src.startsWith("https://") || src.startsWith("http://");
}

function ImagePreview({ src }: { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!canPreview(src) || failedSrc === src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailedSrc(src)}
      className="mt-3 h-36 w-full rounded-lg object-cover"
    />
  );
}

export function TextControl({
  id,
  label,
  value,
  onChange,
  multiline = false,
  image = false,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  image?: boolean;
  hint?: string;
}) {
  return (
    <div className={multiline || image ? "sm:col-span-2" : undefined}>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 h-10 rounded-lg px-3"
        />
      )}
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      {image ? <ImagePreview src={value} /> : null}
    </div>
  );
}

function readField<T extends object>(item: T, key: keyof T & string) {
  const value = item[key];
  return typeof value === "string" ? value : "";
}

export function RecordList<T extends object>({
  items,
  onChange,
  fields,
  createItem,
  itemName,
  idPrefix,
  min = 1,
  max = 6,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldConfig<T>[];
  createItem: () => T;
  itemName: string;
  idPrefix: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${idPrefix}-${index}`} className="rounded-lg border border-border bg-background p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg">
              {itemName} {index + 1}
            </h3>
            {items.length > min ? (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase hover:text-destructive"
              >
                Remove
              </button>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <TextControl
                key={field.key}
                id={`${idPrefix}-${index}-${field.key}`}
                label={field.label}
                value={readField(item, field.key)}
                multiline={field.multiline}
                image={field.image}
                hint={field.hint}
                onChange={(value) =>
                  onChange(
                    items.map((current, itemIndex) =>
                      itemIndex === index ? ({ ...current, [field.key]: value } as T) : current,
                    ),
                  )
                }
              />
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= max}
          onClick={() => onChange([...items, createItem()])}
        >
          Add {itemName.toLowerCase()}
        </Button>
        <p className="text-xs text-muted-foreground">Up to {max}.</p>
      </div>
    </div>
  );
}
