import { db } from "@/config/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

const PROFESSIONALS_DATA = [
  // Coiffure (5)
  {
    id: "pro-1",
    businessName: "The Barber Shop",
    category: "Coiffure",
    services: ["Coupe homme", "Barbe", "Coloration"],
    rating: 4.9,
    reviewCount: 179,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: "15 Rue de Rivoli, Paris",
      distance: 0.7,
    },
    openingHours: { open: "09:00", close: "20:00" },
    price: "€€",
  },
  {
    id: "pro-2",
    businessName: "Salon Élégance",
    category: "Coiffure",
    services: ["Coupe femme", "Brushing", "Coloration", "Mèches"],
    rating: 4.7,
    reviewCount: 203,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8606,
      lng: 2.3376,
      address: "42 Avenue des Champs-Élysées, Paris",
      distance: 1.2,
    },
    openingHours: { open: "08:30", close: "19:00" },
    price: "€€€",
  },
  {
    id: "pro-3",
    businessName: "Urban Cuts",
    category: "Barbier",
    services: ["Coupe homme", "Dégradé", "Barbe design"],
    rating: 4.8,
    reviewCount: 145,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8738,
      lng: 2.295,
      address: "28 Rue de Clichy, Paris",
      distance: 2.1,
    },
    openingHours: { open: "10:00", close: "21:00" },
    price: "€€",
  },
  {
    id: "pro-4",
    businessName: "Coiffure Chic",
    category: "Coiffure",
    services: ["Coupe femme", "Coiffure mariée", "Extensions"],
    rating: 4.6,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8442,
      lng: 2.3708,
      address: "12 Boulevard Saint-Germain, Paris",
      distance: 1.8,
    },
    openingHours: { open: "09:00", close: "18:00" },
    price: "€€€",
  },
  {
    id: "pro-5",
    businessName: "Barber King",
    category: "Barbier",
    services: ["Coupe homme", "Taille barbe", "Rasage traditionnel"],
    rating: 4.9,
    reviewCount: 267,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8529,
      lng: 2.3499,
      address: "5 Rue du Temple, Paris",
      distance: 0.9,
    },
    openingHours: { open: "09:00", close: "20:00" },
    price: "€€",
  },

  // Esthétique (5)
  {
    id: "pro-6",
    businessName: "Beauty Lounge",
    category: "Esthétique",
    services: ["Soin visage", "Épilation", "Maquillage"],
    rating: 4.8,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8656,
      lng: 2.3212,
      address: "8 Rue de la Paix, Paris",
      distance: 1.5,
    },
    openingHours: { open: "10:00", close: "19:00" },
    price: "€€€",
  },
  {
    id: "pro-7",
    businessName: "Zen Esthétique",
    category: "Esthétique",
    services: ["Soin visage", "Massage facial", "Peeling"],
    rating: 4.7,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8467,
      lng: 2.3369,
      address: "20 Rue du Bac, Paris",
      distance: 2.3,
    },
    openingHours: { open: "09:00", close: "18:00" },
    price: "€€",
  },
  {
    id: "pro-8",
    businessName: "Glow Up Studio",
    category: "Esthétique",
    services: ["Épilation laser", "Microneedling", "Soin anti-âge"],
    rating: 4.9,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8704,
      lng: 2.3164,
      address: "18 Boulevard Haussmann, Paris",
      distance: 1.7,
    },
    openingHours: { open: "10:00", close: "20:00" },
    price: "€€€€",
  },
  {
    id: "pro-9",
    businessName: "Institut Belle Peau",
    category: "Esthétique",
    services: ["Soin visage", "Épilation cire", "Teinture sourcils"],
    rating: 4.5,
    reviewCount: 112,
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8589,
      lng: 2.3469,
      address: "7 Rue de Turenne, Paris",
      distance: 1.1,
    },
    openingHours: { open: "09:30", close: "18:30" },
    price: "€€",
  },
  {
    id: "pro-10",
    businessName: "Pure Skin",
    category: "Esthétique",
    services: ["Hydrafacial", "LED thérapie", "Microblading"],
    rating: 4.8,
    reviewCount: 178,
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8754,
      lng: 2.3382,
      address: "32 Rue du Faubourg Montmartre, Paris",
      distance: 2.5,
    },
    openingHours: { open: "10:00", close: "19:00" },
    price: "€€€",
  },

  // Manucure (5)
  {
    id: "pro-11",
    businessName: "Nail Art Paradise",
    category: "Manucure",
    services: ["Manucure", "Pédicure", "Nail art", "Gel"],
    rating: 4.7,
    reviewCount: 145,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8534,
      lng: 2.3488,
      address: "10 Rue des Francs Bourgeois, Paris",
      distance: 0.8,
    },
    openingHours: { open: "10:00", close: "20:00" },
    price: "€€",
  },
  {
    id: "pro-12",
    businessName: "Onglerie Chic",
    category: "Manucure",
    services: ["Manucure semi-permanente", "Pose capsules", "Nail art"],
    rating: 4.9,
    reviewCount: 267,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.863,
      lng: 2.3292,
      address: "5 Place Vendôme, Paris",
      distance: 1.4,
    },
    openingHours: { open: "09:00", close: "19:00" },
    price: "€€€",
  },
  {
    id: "pro-13",
    businessName: "Nails & Co",
    category: "Manucure",
    services: ["Manucure express", "Pédicure spa", "Gel polish"],
    rating: 4.6,
    reviewCount: 134,
    image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8416,
      lng: 2.3209,
      address: "22 Rue de Grenelle, Paris",
      distance: 2.0,
    },
    openingHours: { open: "10:00", close: "19:00" },
    price: "€€",
  },
  {
    id: "pro-14",
    businessName: "Glam Nails",
    category: "Manucure",
    services: ["Manucure russe", "Extensions ongles", "Nail art 3D"],
    rating: 4.8,
    reviewCount: 198,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8779,
      lng: 2.335,
      address: "15 Rue de Rochechouart, Paris",
      distance: 2.8,
    },
    openingHours: { open: "10:00", close: "21:00" },
    price: "€€€",
  },
  {
    id: "pro-15",
    businessName: "Perfect Nails",
    category: "Manucure",
    services: ["Manucure japonaise", "Pédicure médicale", "Soins des ongles"],
    rating: 4.7,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8503,
      lng: 2.3719,
      address: "8 Boulevard Beaumarchais, Paris",
      distance: 1.6,
    },
    openingHours: { open: "09:30", close: "18:30" },
    price: "€€",
  },

  // Massage (3)
  {
    id: "pro-16",
    businessName: "Spa Zen",
    category: "Massage",
    services: ["Massage relaxant", "Massage thaï", "Massage sportif"],
    rating: 4.9,
    reviewCount: 312,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8644,
      lng: 2.3388,
      address: "12 Rue Scribe, Paris",
      distance: 1.3,
    },
    openingHours: { open: "10:00", close: "21:00" },
    price: "€€€€",
  },
  {
    id: "pro-17",
    businessName: "Massage Therapy",
    category: "Massage",
    services: [
      "Massage deep tissue",
      "Réflexologie",
      "Massage aux pierres chaudes",
    ],
    rating: 4.8,
    reviewCount: 245,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8408,
      lng: 2.3555,
      address: "18 Rue Monge, Paris",
      distance: 1.9,
    },
    openingHours: { open: "09:00", close: "20:00" },
    price: "€€€",
  },
  {
    id: "pro-18",
    businessName: "Bien-Être Massage",
    category: "Massage",
    services: ["Massage californien", "Massage ayurvédique", "Shiatsu"],
    rating: 4.7,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8759,
      lng: 2.3584,
      address: "25 Rue du Faubourg Poissonnière, Paris",
      distance: 2.4,
    },
    openingHours: { open: "10:00", close: "19:00" },
    price: "€€€",
  },

  // Tattoo (2)
  {
    id: "pro-19",
    businessName: "Ink Studio",
    category: "Tattoo",
    services: ["Tatouage personnalisé", "Tatouage minimaliste", "Cover-up"],
    rating: 4.9,
    reviewCount: 278,
    image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800",
    gallery: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  ],
  instagramHandle: 'thebarber_shop',
    location: {
      lat: 48.8586,
      lng: 2.3639,
      address: "14 Rue Oberkampf, Paris",
      distance: 1.0,
    },
    openingHours: { open: "11:00", close: "20:00" },
    price: "€€€€",
  },
  {
    id: "pro-20",
    businessName: "Art Tattoo Paris",
    category: "Tattoo",
    services: ["Tatouage réaliste", "Tatouage japonais", "Piercing"],
    rating: 4.8,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800",
    location: {
      lat: 48.8671,
      lng: 2.3569,
      address: "9 Rue de la Roquette, Paris",
      distance: 1.5,
    },
    openingHours: { open: "12:00", close: "21:00" },
    price: "€€€€",
  },
];
export async function seedProfessionals() {
  console.log(
    "🌱 Début du seeding de",
    PROFESSIONALS_DATA.length,
    "professionnels..."
  );

  try {
    let successCount = 0;

    for (const pro of PROFESSIONALS_DATA) {
      try {
        const proData = {
          ...pro,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isVerified: true,
          isActive: true,
        };

        await setDoc(doc(db, "businesses", pro.id), proData);
        console.log(
          `✅ ${++successCount}/${PROFESSIONALS_DATA.length} - Créé: ${
            pro.businessName
          }`
        );
      } catch (error) {
        console.error(`❌ Erreur pour ${pro.businessName}:`, error);
      }
    }

    console.log(
      "✨ Seeding terminé ! Total:",
      successCount,
      "professionnels créés"
    );
    return { success: true, count: successCount };
  } catch (error) {
    console.error("❌ Erreur globale lors du seeding:", error);
    throw error;
  }
}
