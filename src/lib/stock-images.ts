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
  boutique: {
    src: unsplash("1441984904996-e0b6ba687e04"),
    alt: "Interior de una boutique de ropa",
  },
  tailoring: {
    src: unsplash("1753162660069-d4145d9a95f7"),
    alt: "Costura de una prenda en máquina de coser",
  },
  embroidery: {
    src: unsplash("1695291826499-494726bb7bf3"),
    alt: "Detalle de bordado con pedrería en una prenda de alta costura",
  },
  blouses: {
    src: unsplash("1612423284934-2850a4ea6b0f"),
    alt: "Blusas estampadas en perchas de madera",
  },
  monochromeCoat: {
    src: unsplash("1587115924362-622c3fa065bd"),
    alt: "Retrato en blanco y negro de una mujer con abrigo oscuro",
  },
  mirrorDress: {
    src: unsplash("1632823215552-cd0c86965d3e"),
    alt: "Mujer con vestido negro frente a un espejo, en blanco y negro",
  },
  redBlazer: {
    src: unsplash("1580478491436-fd6a937acc9e"),
    alt: "Modelo con blazer rojo y guantes de cuero",
  },
  sunglassesBlazer: {
    src: unsplash("1605813808456-26c16c0dfb77"),
    alt: "Mujer con blazer oscuro y gafas de sol",
  },
  scarfWoman: {
    src: unsplash("1764179690237-6c9a7a48406c"),
    alt: "Mujer con pañuelo y abrigo claro sosteniendo un bolso",
  },
  leatherTote: {
    src: unsplash("1624687943971-e86af76d57de"),
    alt: "Bolso tote de cuero color miel colgado en la pared",
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
