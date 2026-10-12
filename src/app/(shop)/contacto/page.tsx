import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Hash,
  HeartHandshake,
  Mail,
  MessageCircle,
  PackageSearch,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/marketing/PageHero";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Faq } from "@/components/marketing/Faq";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/layout/SocialIcons";
import { Spotlight } from "@/components/motion/Spotlight";

import { tMany } from "@/lib/i18n";
import { CONTACT, whatsappUrl } from "@/lib/site";
import { ADMIN_INBOX, isMailConfigured } from "@/lib/mailer";
import { STOCK_IMAGES } from "@/lib/stock-images";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp o correo: te ayudamos con tallas, disponibilidad y el estado de tu compra.",
  alternates: { canonical: "/contacto" },
};

const FORM_ANCHOR = "#formulario";

type Social = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

function ChannelCard({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-5 rounded-2xl border border-border bg-background p-7 shadow-[0_24px_60px_-30px_rgba(10,10,11,0.3)] hover-lift">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-inverse-accent transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
      {action}
    </div>
  );
}

function CardAction({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="-my-2.5 inline-flex w-fit items-center gap-2 py-2.5 text-sm font-medium text-foreground"
    >
      <span className="border-b border-foreground pb-0.5">{label}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export default async function ContactPage() {
  const canSubmit = isMailConfigured() && Boolean(ADMIN_INBOX);
  const c = await tMany({
    shopWindowAlt: STOCK_IMAGES.shopWindow.alt,
    home: "Inicio",
    eyebrow: "Contacto",
    title: "Estamos para ayudarte",
    description:
      "Tallas, disponibilidad o el estado de tu compra: escríbenos y te responde una persona de nuestro equipo, no un robot.",
    whatsTitle: "WhatsApp",
    whatsText:
      "La vía más rápida para resolver dudas sobre tallas, disponibilidad o el estado de tu pedido.",
    whatsCta: "Escribir por WhatsApp",
    mailTitle: "Correo",
    mailText:
      "Ideal para consultas detalladas o para enviarnos fotos de una pieza.",
    socialTitle: "Redes sociales",
    socialText: "Nuevas llegadas, lanzamientos y piezas destacadas antes que nadie.",
    socialSoon: "Muy pronto",
    useForm: "Usar el formulario",
    formEyebrow: "Escríbenos",
    formTitle: "Cuéntanos qué necesitas",
    formText: canSubmit
      ? "Completa el formulario y te responderemos por correo. Mientras más detalles nos des, más rápido podremos ayudarte."
      : "Completa el formulario y lo abriremos listo para enviar. Mientras más detalles nos des, más rápido podremos ayudarte.",
    tipsTitle: "Para ayudarte más rápido, incluye:",
    tip1: "Tu número de pedido, si ya compraste",
    tip2: "El producto y la talla que te interesan",
    tip3: "Fotos claras si una pieza llegó con daño de fábrica",
    name: "Tu nombre",
    topic: "Motivo",
    topicOrder: "Consulta sobre un pedido",
    topicProduct: "Información de un producto",
    topicOther: "Otro",
    email: "Tu correo",
    phone: "Teléfono",
    optional: "Opcional",
    send: "Enviar mensaje",
    pending: "Enviando…",
    sentTitle: "¡Mensaje enviado!",
    sentText: "Gracias por escribirnos. Te responderemos al correo que nos dejaste lo antes posible.",
    submitHint: "Usamos tus datos solo para responder tu mensaje.",
    message: "Mensaje",
    placeholder: "Cuéntanos en qué te podemos ayudar…",
    sendWhatsapp: "Enviar por WhatsApp",
    sendEmail: "Enviar por correo",
    required: "Escribe tu nombre y tu mensaje para continuar.",
    greeting: "Hola, soy",
    hint: "Se abrirá tu app con el mensaje ya redactado; solo tienes que enviarlo.",
    unavailable: "El envío se activará en cuanto publiquemos nuestros canales de atención.",
    helpEyebrow: "Centro de ayuda",
    helpTitle: "¿En qué te podemos ayudar?",
    h1: "Pedidos y pagos",
    h1t: "Consulta el estado de tu pedido, tu pago o tu envío.",
    h1l: "Ver mis pedidos",
    h2: "Tallas y disponibilidad",
    h2t: "Cada producto muestra sus tallas y cuáles están agotadas. Si dudas, pregúntanos.",
    h2l: "Explorar la tienda",
    h3: "Daño de fábrica",
    h3t: "Repórtalo dentro de las primeras 24 horas desde que recibes tu pedido, con fotos del daño.",
    h3l: "Política de devoluciones",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Antes de escribirnos",
    faqText:
      "Reunimos las dudas más comunes sobre pedidos, pagos y tallas. Quizá tu respuesta ya esté aquí.",
    stillTitle: "¿No encontraste tu respuesta?",
    stillText:
      "Escríbenos y te responde una persona de nuestro equipo, con la información de tu pedido a la mano.",
    stillCta: "Escribir ahora",
    quick1: "Atención personal",
    quick1t: "Te responde una persona, no un robot",
    quick2: "Pagos seguros",
    quick2t: "Tarjeta de crédito o débito",
    q1: "¿Cómo sé el estado de mi pedido?",
    a1: "Inicia sesión y entra a “Mis pedidos”: ahí ves cada pedido con su estado actualizado (pago pendiente, confirmado, enviado).",
    q2: "No terminé de pagar, ¿qué pasa con mi pedido?",
    a2: "Desde “Mis pedidos” puedes completar el pago o cancelarlo. Si no lo completas, el pedido se cancela solo y las piezas vuelven a tu carrito.",
    q3: "¿Qué hago si mi pieza llegó con un defecto?",
    a3: "Escríbenos dentro de las primeras 24 horas desde que la recibes, con fotos del daño de fábrica, y lo resolvemos contigo.",
    q4: "¿Puedo cambiar una talla?",
    a4: "Todas las ventas son finales, por eso te recomendamos revisar las tallas disponibles y consultarnos antes de comprar.",
  });

  const whatsapp = whatsappUrl();
  const socials = (
    [
      CONTACT.instagram && { href: CONTACT.instagram, label: "Instagram", icon: InstagramIcon },
      CONTACT.facebook && { href: CONTACT.facebook, label: "Facebook", icon: FacebookIcon },
      CONTACT.tiktok && { href: CONTACT.tiktok, label: "TikTok", icon: TikTokIcon },
    ] as (Social | null)[]
  ).filter((social): social is Social => Boolean(social));

  const helpTopics = [
    { icon: PackageSearch, title: c.h1, text: c.h1t, href: "/pedidos", link: c.h1l },
    { icon: Ruler, title: c.h2, text: c.h2t, href: "/tienda", link: c.h2l },
    { icon: ShieldAlert, title: c.h3, text: c.h3t, href: "/politicas/devoluciones", link: c.h3l },
  ];

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        image={STOCK_IMAGES.sunglassesBlazer}
        breadcrumb={{ home: c.home, current: c.eyebrow }}
        overlapBottom
      />

      {/* Tarjetas que "montan" sobre el borde inferior del hero. */}
      <section className="relative z-10 mx-auto -mt-16 grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
        <ChannelCard
          icon={MessageCircle}
          title={c.whatsTitle}
          text={c.whatsText}
          action={
            <CardAction
              href={whatsapp ?? FORM_ANCHOR}
              label={whatsapp ? c.whatsCta : c.useForm}
              external={Boolean(whatsapp)}
            />
          }
        />
        <ChannelCard
          icon={Mail}
          title={c.mailTitle}
          text={c.mailText}
          action={
            <CardAction
              href={CONTACT.email ? `mailto:${CONTACT.email}` : FORM_ANCHOR}
              label={CONTACT.email ?? c.useForm}
            />
          }
        />
        <ChannelCard
          icon={Sparkles}
          title={c.socialTitle}
          text={c.socialText}
          action={
            socials.length > 0 ? (
              <div className="flex gap-2">
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">{c.socialSoon}</span>
            )
          }
        />
      </section>

      <section
        id="formulario"
        className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20"
      >
        <div className="flex flex-col gap-8">
          <SectionHeading eyebrow={c.formEyebrow} title={c.formTitle} description={c.formText} />
          <div className="flex flex-col gap-4 rounded-2xl bg-accent-soft p-7">
            <p className="text-sm font-medium text-foreground">{c.tipsTitle}</p>
            <ul className="flex flex-col gap-3">
              {[
                { icon: Hash, text: c.tip1 },
                { icon: Ruler, text: c.tip2 },
                { icon: Camera, text: c.tip3 },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-accent">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-background p-6 shadow-[0_30px_80px_-40px_rgba(10,10,11,0.35)] sm:p-10">
          <ContactForm
            canSubmit={canSubmit}
            whatsappNumber={CONTACT.whatsapp}
            email={CONTACT.email}
            copy={{
              name: c.name,
              email: c.email,
              phone: c.phone,
              optional: c.optional,
              send: c.send,
              pending: c.pending,
              sentTitle: c.sentTitle,
              sentText: c.sentText,
              submitHint: c.submitHint,
              topic: c.topic,
              topics: [c.topicOrder, c.topicProduct, c.topicOther],
              message: c.message,
              placeholder: c.placeholder,
              sendWhatsapp: c.sendWhatsapp,
              sendEmail: c.sendEmail,
              required: c.required,
              greeting: c.greeting,
              hint: c.hint,
              unavailable: c.unavailable,
            }}
          />
        </div>
      </section>

      <section className="bg-inverse text-inverse-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:py-24 sm:px-6">
          <div className="flex flex-col gap-3">
            <p className="eyebrow flex items-center gap-3 text-inverse-accent">
              <span className="h-px w-8 bg-inverse-accent" aria-hidden="true" />
              {c.helpEyebrow}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl">{c.helpTitle}</h2>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-inverse-border md:grid-cols-3">
            {helpTopics.map(({ icon: Icon, title, text, href, link }) => (
              <li key={title}>
                <Spotlight className="h-full bg-inverse">
                  <Link href={href} className="group flex h-full flex-col gap-4 p-7">
                    <Icon
                      className="h-6 w-6 text-inverse-accent transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-xl">{title}</h3>
                    <p className="flex-1 text-sm leading-relaxed text-inverse-muted">{text}</p>
                    <span className="flex items-center gap-2 text-sm font-medium text-inverse-accent">
                      {link}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Spotlight>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow={c.faqEyebrow} title={c.faqTitle} description={c.faqText} />
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: HeartHandshake, title: c.quick1, text: c.quick1t },
                { icon: ShieldCheck, title: c.quick2, text: c.quick2t },
              ].map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="group flex items-start gap-3 rounded-2xl border border-border bg-background p-5 hover-lift hover:border-foreground/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-inverse group-hover:text-inverse-accent">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{title}</span>
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={whatsapp ?? FORM_ANCHOR}
              {...(whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl bg-inverse p-7 text-inverse-foreground"
            >
              <Image
                src={STOCK_IMAGES.shopWindow.src}
                alt={c.shopWindowAlt}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="-z-20 object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.35)_100%)]"
              />
              <p className="font-display text-2xl">{c.stillTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-inverse-foreground/80">
                {c.stillText}
              </p>
              <span className="mt-5 flex w-fit items-center gap-2 rounded-full bg-inverse-foreground px-5 py-2.5 text-sm font-medium text-inverse transition-colors duration-300 group-hover:bg-inverse-accent">
                {c.stillCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
          <Faq
            items={[
              { question: c.q1, answer: c.a1 },
              { question: c.q2, answer: c.a2 },
              { question: c.q3, answer: c.a3 },
              { question: c.q4, answer: c.a4 },
            ]}
          />
        </div>
      </section>
    </>
  );
}
