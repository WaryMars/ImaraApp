import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
}

interface TimeSlotPickerProps {
  openingHours: {
    open: string; // "09:00"
    close: string; // "20:00"
  };
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  slotDuration?: number; // minutes (default: 30)
  breakTime?: { start: string; end: string }; // optional pause
}

/**
 * Génère les créneaux horaires entre open et close
 * Exemple: "09:00" à "20:00" avec 30 min = [09:00, 09:30, 10:00, ...]
 */
const generateTimeSlots = (
  open: string,
  close: string,
  slotDuration: number = 30,
  breakTime?: { start: string; end: string }
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  const [openHour, openMin] = open.split(":").map(Number);
  const [closeHour, closeMin] = close.split(":").map(Number);

  const breakStartTime = breakTime
    ? breakTime.start.split(":").map(Number)
    : null;
  const breakEndTime = breakTime ? breakTime.end.split(":").map(Number) : null;

  const breakStartHour = breakStartTime ? breakStartTime[0] : null;
  const breakStartMin = breakStartTime ? breakStartTime[1] : null;
  const breakEndHour = breakEndTime ? breakEndTime[0] : null;
  const breakEndMin = breakEndTime ? breakEndTime[1] : null;

  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const timeString = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;

    // Vérifie si dans break time
    const isInBreak =
      breakStartHour !== null &&
      breakEndHour !== null &&
      breakStartMin !== null &&
      breakEndMin !== null &&
      (currentHour > breakStartHour ||
        (currentHour === breakStartHour && currentMin >= breakStartMin)) &&
      (currentHour < breakEndHour ||
        (currentHour === breakEndHour && currentMin < breakEndMin));

    slots.push({
      time: timeString,
      available: !isInBreak,
    });

    // Ajoute duration
    currentMin += slotDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

export const TimeSlotPicker = ({
  openingHours,
  selectedTime,
  onSelectTime,
  slotDuration = 30,
  breakTime,
}: TimeSlotPickerProps) => {
  // Génère les créneaux dynamiquement
  const timeSlots = useMemo(
    () =>
      generateTimeSlots(
        openingHours.open,
        openingHours.close,
        slotDuration,
        breakTime
      ),
    [openingHours, slotDuration, breakTime]
  );

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = selectedTime === item.time;
    const isDisabled = !item.available;

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && onSelectTime(item.time)}
        disabled={isDisabled}
        style={[
          styles.timeSlot,
          isSelected && styles.timeSlotSelected,
          isDisabled && styles.timeSlotDisabled,
        ]}
      >
        <Text
          style={[
            styles.timeSlotText,
            isSelected && styles.timeSlotTextSelected,
            isDisabled && styles.timeSlotTextDisabled,
          ]}
        >
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sélectionnez une heure</Text>
      <FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item.time}
        numColumns={4}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  timeSlot: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#444444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeSlotSelected: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  timeSlotDisabled: {
    backgroundColor: "#222222",
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C3C5CA",
  },
  timeSlotTextSelected: {
    color: "#000000",
  },
  timeSlotTextDisabled: {
    color: "#666666",
  },
});
