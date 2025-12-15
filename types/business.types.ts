import { Timestamp } from "firebase/firestore";
export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  serviceId: string | null;
  uploadedAt: Timestamp;
  isActive: boolean;
}
export interface SocialLinks {
  instagram: string | null;
  facebook: string | null;
  website: string | null;
}
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}
export interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}
export interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}
export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string | null;
  coverImage: string | null;
  gallery: GalleryImage[];
  socialLinks: SocialLinks;
  address: Address;
  tags: string[];
  services: Service[];
  schedule: Schedule;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  requiresDeposit: boolean; // Ce service exige un acompte ?
  depositPercentage: number; // 30, 50, 100 ou 0
}
