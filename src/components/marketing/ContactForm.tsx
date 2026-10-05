"use client";

import { useActionState, useState, useTransition } from "react";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FormError } from "@/components/ui/FormError";
import { submitContactAction, type ContactActionState } from "@/server/actions/contact-actions";
import { cn } from "@/lib/utils";

export type ContactFormCopy = {
  name: string;
  email: string;
  phone: string;
  optional: string;
  topic: string;
  topics: string[];
  message: string;
  placeholder: string;
  send: string;
  pending: string;
  sentTitle: string;
  sentText: string;
  sendWhatsapp: string;
  sendEmail: string;
  required: string;
  greeting: string;
  hint: string;
  submitHint: string;
  unavailable: string;
};

const MAX_MESSAGE = 600;
const initialState: ContactActionState = {};

// Con SMTP configurado (canSubmit) el mensaje llega al correo del negocio
// desde el servidor; sin él, se abre ya redactado en WhatsApp o en el cliente
// de correo del visitante.
export function ContactForm({
  canSubmit,
  whatsappNumber,
  email,
  copy,
}: {
  canSubmit: boolean;
  whatsappNumber: string | null;
  email: string | null;
  copy: ContactFormCopy;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState);
  const [, startTransition] = useTransition();

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

  if (state.sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-inverse-accent">
          <CircleCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="font-display text-2xl">{copy.sentTitle}</h3>
        <p className="text-sm text-muted-foreground">{copy.sentText}</p>
      </div>
    );
  }

  return (
    <form
      // onSubmit + startTransition en vez de action={formAction}: con action,
      // React vacía el formulario al terminar aunque el servidor devuelva un
      // error, y la persona tendría que reescribir todo.
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          const data = new FormData(event.currentTarget);
          startTransition(() => formAction(data));
        } else {
          openChannel(event.currentTarget, whatsappNumber ? "whatsapp" : "email");
        }
      }}
      className="flex flex-col gap-5"
      noValidate={!canSubmit}
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
        {canSubmit && (
          <>
            <TextField
              label={copy.email}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <TextField
              label={copy.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={copy.optional}
              maxLength={30}
            />
          </>
        )}
      </div>
      {canSubmit && (
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
      )}
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
      <FormError message={error ?? state.error} />
      <div className="flex flex-col gap-3 sm:flex-row">
        {canSubmit ? (
          <Button type="submit" size="lg" loading={isPending}>
            {!isPending && <Send className="h-4 w-4" />}
            {isPending ? copy.pending : copy.send}
          </Button>
        ) : (
          whatsappNumber && (
            <Button type="submit" size="lg">
              <Send className="h-4 w-4" />
              {copy.sendWhatsapp}
            </Button>
          )
        )}
        {canSubmit && whatsappNumber && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (form) openChannel(form, "whatsapp");
            }}
          >
            {copy.sendWhatsapp}
          </Button>
        )}
        {!canSubmit && email && (
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
        {!canSubmit && !whatsappNumber && !email && (
          <Button type="button" size="lg" disabled>
            <Send className="h-4 w-4" />
            {copy.sendWhatsapp}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {canSubmit ? copy.submitHint : whatsappNumber || email ? copy.hint : copy.unavailable}
      </p>
    </form>
  );
}
