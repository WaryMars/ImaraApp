import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface Business {
  id: string;
  businessName: string;
  category: string;
  services: string[];
  rating: number;
  reviewCount: number;
  image: string;
  gallery?: string[];
  instagramHandle?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    distance: number;
  };
  openingHours: {
    open: string;
    close: string;
  };
  price: string;
  isVerified: boolean;
  isActive: boolean;
}

export function useBusinesses(filters?: {
  category?: string;
  maxDistance?: number;
}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, [filters?.category]);

  const fetchBusinesses = async () => {
    try {
      console.log("🔍 Récupération avec filtres:", filters);
      setLoading(true);
      setError(null);

      let q = query(collection(db, "businesses"));

      if (filters?.category) {
        // console.log("🎯 Filtrage par catégorie:", filters.category);
        q = query(
          collection(db, "businesses"),
          where("category", "==", filters.category)
        );
      }

      const querySnapshot = await getDocs(q);
      // console.log("📦 Documents trouvés:", querySnapshot.size);

      const businessesData: Business[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        businessesData.push({
          id: doc.id,
          businessName: data.businessName,
          category: data.category,
          services: data.services,
          rating: data.rating,
          reviewCount: data.reviewCount,
          image: data.image,
          location: data.location,
          openingHours: data.openingHours,
          price: data.price,
          isVerified: data.isVerified,
          isActive: data.isActive,
        });
      });

      // Tri local par rating
      businessesData.sort((a, b) => b.rating - a.rating);

      // console.log("✅ Businesses chargés:", businessesData.length);
      if (businessesData.length > 0) {
        // console.log(
        //   "📋 Premier business:",
        //   businessesData[0].businessName,
        //   "- Catégorie:",
        //   businessesData[0].category
        // );
      }

      setBusinesses(businessesData);
      setError(null);
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError("Impossible de charger: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return { businesses, loading, error, refetch: fetchBusinesses };
}
