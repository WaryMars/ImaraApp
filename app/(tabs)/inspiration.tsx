import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ExternalLink } from "lucide-react-native";

// Remplacez par votre URL de production une fois déployé
// ex: [https://us-central1-imara-app.cloudfunctions.net/searchInspiration](https://us-central1-imara-app.cloudfunctions.net/searchInspiration)
const FIREBASE_FUNCTION_URL =
  "[https://VOTRE-PROJET.cloudfunctions.net/searchInspiration](https://VOTRE-PROJET.cloudfunctions.net/searchInspiration)";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Interface pour typer nos données côté App
interface InspirationImg {
  id?: string;
  url: string;
  title: string;
  link?: string;
}

export default function InspirationScreen() {
  const [searchText, setSearchText] = useState("");
  const [galleryData, setGalleryData] = useState<InspirationImg[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState<InspirationImg | null>(null);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchText }),
      });
      const result = await response.json();
      if (result.data) {
        setGalleryData(result.data);
      } else {
        Alert.alert("Info", "Aucun résultat trouvé.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Problème de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const { col1, col2 } = useMemo(() => {
    const c1 = galleryData.filter((_, i) => i % 2 === 0);
    const c2 = galleryData.filter((_, i) => i % 2 === 1);
    return { col1: c1, col2: c2 };
  }, [galleryData]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Inspiration</Text>

        <View style={styles.searchBox}>
          <Search color="#a1a1aa" size={20} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Rechercher..."
            placeholderTextColor="#8a8a93"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          {loading && <ActivityIndicator color="#C0A062" />}
        </View>

        <ScrollView contentContainerStyle={styles.masonryOuter}>
          <View style={styles.col}>
            {col1.map((img, i) => (
              <TouchableOpacity
                key={i}
                style={styles.card}
                onPress={() => setSelectedImg(img)}
              >
                <Image
                  source={{ uri: img.url }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.col}>
            {col2.map((img, i) => (
              <TouchableOpacity
                key={i}
                style={styles.card}
                onPress={() => setSelectedImg(img)}
              >
                <Image
                  source={{ uri: img.url }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={!!selectedImg}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImg(null)}
        >
          <View style={styles.fullscreenWrapper}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedImg(null)}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            {selectedImg && (
              <>
                <Image
                  source={{ uri: selectedImg.url }}
                  style={styles.fullscreenImg}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.sourceBtn}
                  onPress={() =>
                    selectedImg.link && Linking.openURL(selectedImg.link)
                  }
                >
                  <Text style={{ fontWeight: "bold" }}>Voir la source</Text>
                  <ExternalLink
                    size={16}
                    color="#000"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#18181a" },
  container: { flex: 1, backgroundColor: "#18181a" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    alignSelf: "center",
    marginVertical: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23232F",
    borderRadius: 16,
    margin: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: { flex: 1, color: "#eee", fontSize: 16, height: "100%" },
  masonryOuter: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  col: { flex: 1, gap: 10 },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#333",
    marginBottom: 10,
  },
  cardImg: { width: "100%", height: 200 },
  fullscreenWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImg: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
  },
  closeText: { color: "#fff", fontSize: 24, marginTop: -2 },
  sourceBtn: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 25,
  },
});
