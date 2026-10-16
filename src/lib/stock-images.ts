// Fotos de ambientación de Unsplash (licencia Unsplash: uso comercial libre,
// sin atribución obligatoria) mientras no existan fotos propias de la marca.
// Elegidas sin logos visibles de otras marcas, para no sugerir que vendemos
// esas firmas. Cada foto se usa en un solo lugar del sitio, para que ninguna
// se repita al navegar. Reemplazar por fotos propias = cambiar solo este archivo.
function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;
}

export const STOCK_IMAGES = {
  // Fotos de campaña entregadas por la clienta (public/images). `position`
  // mantiene a la modelo, que está a la derecha, a la vista al recortar.
  heroHome: {
    src: "/images/hero-home.jpg",
    alt: "Modelo con vestido blanco, bolso negro con cadena dorada y sandalias de tacón",
    position: "75% center",
  },
  heroAbout: {
    src: "/images/hero-nosotros.jpg",
    alt: "Modelo sentada con las piernas cruzadas y zapatos de tacón negros",
    position: "75% center",
  },
  // Retrato de HJ: va en Nosotros (filosofía) y en el login de clientes.
  hjPortrait: {
    src: "/images/hj-picture.jpeg",
    alt: "Retrato en blanco y negro de HJ, fundadora de Glam Luxe",
  },
  storyHandbag: {
    src: "/images/about-image2.jpeg",
    alt: "Modelo sentada con bolso negro de cadena dorada y zapatos de tacón",
  },
  storyCloset: {
    src: "/images/about-image3.jpeg",
    alt: "Vestidor con repisas iluminadas llenas de bolsos y zapatos",
  },
  monochromeCoat: {
    src: unsplash("1587115924362-622c3fa065bd"),
    alt: "Retrato en blanco y negro de una mujer con abrigo oscuro",
  },
  mirrorDress: {
    src: unsplash("1632823215552-cd0c86965d3e"),
    alt: "Mujer con vestido negro frente a un espejo, en blanco y negro",
  },
  sunglassesBlazer: {
    src: unsplash("1605813808456-26c16c0dfb77"),
    alt: "Mujer con blazer oscuro y gafas de sol",
  },
  accessoriesSet: {
    src: "/images/about-image4.jpeg",
    alt: "Bolso negro acolchado con cadena, zapatos de tacón, gafas de sol y maquillaje sobre fondo oscuro",
  },
  pearlBox: {
    src: unsplash("1515562141207-7a88fb7ce338"),
    alt: "Collar de perlas dentro de su estuche",
  },
  heels: {
    src: unsplash("1535043934128-cf0b28d52f95"),
    alt: "Zapatos de tacón en tono nude",
  },
  silk: {
    src: unsplash("1619043518800-7f14be467dca"),
    alt: "Pliegues de seda blanca",
  },
  boutiqueMinimal: {
    src: unsplash("1769107805412-90d9191d53e9"),
    alt: "Interior minimalista de una boutique con ropa y accesorios",
  },
  shopWindow: {
    src: unsplash("1785860089217-5c7f62013cb9"),
    alt: "Escaparate con maniquíes, espejos y arreglos florales",
  },
} as const;

export type StockImage = { src: string; alt: string; position?: string };
