// Fuera de AddressForm ("use client"): un Server Component que importa un
// objeto de un módulo cliente recibe una referencia, no el objeto, y no
// podría pasarlo por tMany().
export const ADDRESS_FORM_COPY = {
  fullName: "Nombre completo",
  whatsapp: "WhatsApp",
  email: "Correo",
  addressLine: "Dirección",
  addressType: "Tipo",
  house: "Casa",
  apartment: "Apartamento",
  city: "Ciudad",
  state: "Estado",
  zip: "Código postal",
  notes: "Notas (opcional)",
  pending: "Enviando…",
};

export type AddressFormCopy = typeof ADDRESS_FORM_COPY;
