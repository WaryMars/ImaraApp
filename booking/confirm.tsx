import { useLocalSearchParams } from "expo-router";
import { useBooking } from "@/hooks/useBooking";
import { View, Text } from "react-native";
import { Timestamp } from "firebase/firestore";

export default function ConfirmScreen() {
  const formatBookingDate = (date: Timestamp | Date | string): string => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString("fr-FR");
    } else if (date instanceof Date) {
      return date.toLocaleDateString("fr-FR");
    } else {
      return new Date(date).toLocaleDateString("fr-FR");
    }
  };
  const { id } = useLocalSearchParams();
  const { bookings } = useBooking();

  const booking = bookings.find((b) => b.id === id);

  if (!booking) return <Text>Chargement...</Text>;

  return (
    <View>
      <Text>Réservation confirmée! 🎉</Text>
      <Text>{formatBookingDate(booking.date)}</Text>
      <Text>Heure: {booking.startTime}</Text>
      <Text>Prix: {booking.price}€</Text>
    </View>
  );
}
