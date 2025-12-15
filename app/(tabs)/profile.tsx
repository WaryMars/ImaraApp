import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Lock,
  Star,
  Bookmark,
  Bell,
  LogOut,
  HelpCircle,
  Edit3,
  Image as ImageIcon,
  Trash2,
  KeyRound,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/config/firebase";

// const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

const uploadImageToStorage = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    console.log("🔥 [UPLOAD] Début du upload");
    console.log("🔥 [UPLOAD] User ID:", userId);
    console.log("🔥 [UPLOAD] Image URI:", uri);

    const response = await fetch(uri);
    const blob = await response.blob();
    console.log("📦 Blob créé:", blob.size, "bytes");

    const imagePath = `profile-pictures/${userId}/avatar.jpg`;
    console.log("🔥 [UPLOAD] Chemin Storage:", imagePath);

    const storage = getStorage();
    const fileRef = ref(storage, imagePath);

    const uploadTask = uploadBytesResumable(fileRef, blob);

    const downloadURL = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("⬆️  Progress:", Math.round(progress) + "%");
        },
        (error) => {
          console.error("❌ ERREUR COMPLÈTE:", error);
          console.error("❌ Code:", error?.code);
          console.error("❌ Message:", error?.message);

          // ✅ AFFICHER L'ERREUR COMPLÈTE
          if (error instanceof Error) {
            console.error("❌ Stack:", error.stack);
          }
          console.error("❌ Objet complet:", JSON.stringify(error, null, 2));

          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    return downloadURL;
  } catch (err) {
    console.error("❌ [UPLOAD] Erreur catch:", err);
    throw err;
  }
};

export default function ProfileScreen() {
  const { user, firebaseUser, signOut, refreshUser } = useAuth();

  if (!user || !firebaseUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#14B8A6" />
          <Text style={{ color: "#fff", marginTop: 8 }}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [editVisible, setEditVisible] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [delVisible, setDelVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fullName =
    (user.firstName || "") + (user.lastName ? ` ${user.lastName}` : "");
  const initialName = fullName.trim() || "Utilisateur Imara";
  const initialPhoto =
    user.profilePicture || firebaseUser.photoURL || DEFAULT_AVATAR;

  const [editName, setEditName] = useState(initialName);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhoto, setEditPhoto] = useState(initialPhoto);

  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const stats = {
    reservations: user.favoriteBusinesses?.length ?? 0,
    favoris: user.favoriteBusinesses?.length ?? 0,
  };

  // 📸 Sélectionner une image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.7,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setEditPhoto(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Erreur image", getErrorMessage(err));
    }
  };

  // 💾 Sauvegarde du profil complet
  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      let finalPhotoURL = editPhoto;

      // Si c'est une URI locale (file://), uploader vers Storage
      if (editPhoto && editPhoto.startsWith("file://")) {
        finalPhotoURL = await uploadImageToStorage(editPhoto, firebaseUser.uid);
      }

      // Mise à jour Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: editName,
        photoURL: finalPhotoURL || undefined,
      });

      // Mise à jour email si changé
      if (editEmail !== firebaseUser.email) {
        await updateEmail(firebaseUser, editEmail);
      }

      // Mise à jour Firestore
      const nameParts = editName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await updateDoc(doc(db, "users", firebaseUser.uid), {
        firstName,
        lastName,
        email: editEmail,
        profilePicture: finalPhotoURL,
        updatedAt: new Date(),
      });

      await refreshUser();

      setEditVisible(false);
      Alert.alert("Succès", "Profil mis à jour ✅");
    } catch (err) {
      Alert.alert("Erreur", getErrorMessage(err));
    }
    setLoading(false);
  };

  // 🔐 Changement du mot de passe
  const handleChangePwd = async () => {
    if (pwd1.length < 6) {
      Alert.alert("Mot de passe trop court", "Minimum 6 caractères.");
      return;
    }
    if (pwd1 !== pwd2) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(firebaseUser, pwd1);
      setPwdVisible(false);
      setPwd1("");
      setPwd2("");
      Alert.alert("Succès", "Mot de passe modifié ✅");
    } catch (err) {
      Alert.alert("Erreur", getErrorMessage(err));
    }
    setLoading(false);
  };

  // 🗑️  Suppression du compte
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        deletedAt: new Date(),
        isDeleted: true,
      });

      await deleteUser(firebaseUser);

      setDelVisible(false);
      Alert.alert("Compte supprimé", "Votre compte Imara a bien été supprimé.");
    } catch (err) {
      Alert.alert("Erreur", getErrorMessage(err));
    }
    setLoading(false);
  };

  // 📧 Assistance
  const handleAssistance = () => {
    Linking.openURL("mailto:help@imara.com?subject=Aide%20Imara%20App").catch(
      () => Alert.alert("Erreur", "Impossible d'ouvrir l'email.")
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header profil */}
        <View style={styles.accountBox}>
          <Image
            source={{ uri: editPhoto || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{editName}</Text>
            <Text style={styles.userMail}>{editEmail}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditVisible(true)}
          >
            <Edit3 color="#fff" size={18} />
            <Text style={styles.editText}>Éditer</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <ProfileStat
            label="Réservations"
            icon={<Bookmark color="#14B8A6" size={22} />}
            value={stats.reservations}
          />
          <ProfileStat
            label="Favoris"
            icon={<Star color="#14B8A6" size={22} />}
            value={stats.favoris}
          />
        </View>

        {/* Section 1 */}
        <Section>
          <ProfileItem
            text="Mes réservations"
            icon={<Bookmark color="#fff" size={20} />}
            onPress={() => Alert.alert("TODO", "Navigation vers l'historique.")}
          />
          <ProfileItem
            text="Mes favoris"
            icon={<Star color="#fff" size={20} />}
            onPress={() => Alert.alert("TODO", "Navigation vers favoris.")}
          />
        </Section>

        {/* Section 2 */}
        <Section>
          <ProfileItem
            text="Changer mon mot de passe"
            icon={<KeyRound color="#fff" size={20} />}
            onPress={() => setPwdVisible(true)}
          />
          <ProfileItem
            text="Notifications"
            icon={<Bell color="#fff" size={20} />}
            onPress={() => Alert.alert("TODO", "Réglages notifications.")}
          />
          <ProfileItem
            text="Sécurité"
            icon={<Lock color="#fff" size={20} />}
            onPress={() => Alert.alert("TODO", "Paramètres sécurité.")}
          />
          <ProfileItem
            text="Assistance"
            icon={<HelpCircle color="#fff" size={20} />}
            onPress={handleAssistance}
          />
          <ProfileItem
            text="Supprimer mon compte"
            icon={<Trash2 color="#ff4a6e" size={20} />}
            onPress={() => setDelVisible(true)}
          />
          <ProfileItem
            text="Déconnexion"
            icon={<LogOut color="#fff" size={20} />}
            onPress={signOut}
          />
        </Section>

        {/* MODAL : ÉDITION PROFIL */}
        <Modal
          visible={editVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalWrapper}>
            <View style={styles.modalEdit}>
              <Text style={styles.modalTitle}>Modifier mon profil</Text>

              <TouchableOpacity style={styles.picBtn} onPress={pickImage}>
                <ImageIcon color="#14B8A6" size={19} />
                <Text style={{ color: "#14B8A6", marginLeft: 5 }}>
                  Changer la photo
                </Text>
              </TouchableOpacity>

              <Image
                source={{ uri: editPhoto || DEFAULT_AVATAR }}
                style={[
                  styles.avatar,
                  { marginVertical: 7, alignSelf: "center" },
                ]}
              />

              <TextInput
                style={styles.input}
                value={editName}
                placeholder="Nom"
                onChangeText={setEditName}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                value={editEmail}
                placeholder="Email"
                onChangeText={setEditEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={{ color: "#14B8A6", fontWeight: "bold" }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Enregistrer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL : MOT DE PASSE */}
        <Modal
          visible={pwdVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setPwdVisible(false)}
        >
          <View style={styles.modalWrapper}>
            <View style={styles.modalEdit}>
              <Text style={styles.modalTitle}>Changer mon mot de passe</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={pwd1}
                placeholder="Nouveau mot de passe"
                onChangeText={setPwd1}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                secureTextEntry
                value={pwd2}
                placeholder="Confirmer"
                onChangeText={setPwd2}
                placeholderTextColor="#999"
              />
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setPwdVisible(false)}
                >
                  <Text style={{ color: "#14B8A6", fontWeight: "bold" }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={handleChangePwd}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Enregistrer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL : SUPPRESSION */}
        <Modal
          visible={delVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setDelVisible(false)}
        >
          <View style={styles.modalWrapper}>
            <View style={styles.modalEdit}>
              <Text style={styles.modalTitle}>Supprimer mon compte</Text>
              <Text
                style={{ color: "#fff", marginBottom: 22, textAlign: "center" }}
              >
                Cette action est définitive et irréversible. Tous vos
                rendez-vous et données seront effacés.
              </Text>
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setDelVisible(false)}
                >
                  <Text style={{ color: "#14B8A6", fontWeight: "bold" }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSave, { backgroundColor: "#ff4a6e" }]}
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Supprimer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// COMPOSANTS UI
function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

function ProfileItem({
  text,
  icon,
  onPress,
}: {
  text: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.iconBox}>{icon}</View>
      <Text style={styles.itemText}>{text}</Text>
      <ChevronRight color="#888" size={20} style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

function ProfileStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#131419" },
  accountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22222b",
    margin: 20,
    borderRadius: 18,
    padding: 18,
    marginBottom: 6,
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 40,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#14B8A6",
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userMail: {
    color: "#9b9ba9",
    fontSize: 13,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292935",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginLeft: 10,
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 17,
    marginBottom: 14,
    marginTop: 2,
    gap: 7,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1c1c22",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 3,
    minWidth: 66,
  },
  statVal: {
    color: "#14B8A6",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 1,
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  section: {
    backgroundColor: "#22222b",
    borderRadius: 14,
    marginHorizontal: 18,
    marginBottom: 17,
    paddingVertical: 7,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: "#22222f",
  },
  iconBox: {
    justifyContent: "center",
    alignItems: "center",
    width: 34,
    height: 34,
    borderRadius: 50,
    backgroundColor: "#191921",
    marginRight: 15,
  },
  itemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "#15151ae0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalEdit: {
    width: "100%",
    backgroundColor: "#23232F",
    borderRadius: 18,
    padding: 28,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 9,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 20,
    marginBottom: 19,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#18181a",
    borderRadius: 9,
    padding: 13,
    color: "#fff",
    marginBottom: 12,
    fontSize: 15,
    borderColor: "#22222f",
    borderWidth: 1,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    marginRight: 2,
  },
  modalSave: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    marginLeft: 4,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 7,
  },
  picBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 5,
    backgroundColor: "#191925",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
