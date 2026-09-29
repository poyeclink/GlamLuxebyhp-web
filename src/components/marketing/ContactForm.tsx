"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/lib/utils";

export type ContactFormCopy = {
  name: string;
  topic: string;
  topics: string[];
  message: string;
  placeholder: string;
  sendWhatsapp: string;
  sendEmail: string;
  required: string;
  greeting: string;
  hint: string;
  unavailable: string;
};

const MAX_MESSAGE = 600;

// Sin backend de correo todavía: el formulario arma el mensaje y lo abre en
// WhatsApp (o el cliente de correo) ya redactado — el canal que el negocio
// realmente atiende, sin guardar datos del visitante en ningún lado.
export function ContactForm({
  whatsappNumber,
  email,
  copy,
}: {
  whatsappNumber: string | null;
  email: string | null;
  copy: ContactFormCopy;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openChannel(form: HTMLFormElement, channel: "whatsapp" | "email") {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const topic = String(data.get("topic") ?? "");
    const body = message.trim();
    if (!name || !body) {
      setError(copy.required);
      return;
    }
    setError(null);
    const text = [`${copy.greeting} ${name}.`, topic, "", body].join("\n");
    const url =
      channel === "whatsapp"
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
        : `mailto:${email}?subject=${encodeURIComponent(`${topic} — ${name}`)}&body=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        openChannel(event.currentTarget, whatsappNumber ? "whatsapp" : "email");
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label={copy.name} name="name" autoComplete="name" required maxLength={80} />
        <SelectField label={copy.topic} name="topic" defaultValue={copy.topics[0]}>
          {copy.topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="contact-message">{copy.message}</Label>
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              message.length > MAX_MESSAGE * 0.9 && "text-accent",
            )}
          >
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          maxLength={MAX_MESSAGE}
          placeholder={copy.placeholder}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <FormError message={error ?? undefined} />
      <div className="flex flex-col gap-3 sm:flex-row">
        {whatsappNumber && (
          <Button type="submit" size="lg">
            <Send className="h-4 w-4" />
            {copy.sendWhatsapp}
          </Button>
        )}
        {email && (
          <Button
            type={whatsappNumber ? "button" : "submit"}
            variant={whatsappNumber ? "outline" : "primary"}
            size="lg"
            onClick={(event) => {
              if (!whatsappNumber) return;
              const form = event.currentTarget.form;
              if (form) openChannel(form, "email");
            }}
          >
            {copy.sendEmail}
          </Button>
        )}
        {!whatsappNumber && !email && (
          <Button type="button" size="lg" disabled>
            <Send className="h-4 w-4" />
            {copy.sendWhatsapp}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{whatsappNumber || email ? copy.hint : copy.unavailable}</p>
    </form>
  );
}
