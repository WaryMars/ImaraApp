import React, { useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";

export default function GDPRConsentScreen() {
  const [dataProcessing, setDataProcessing] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    whatData: false,
    howUse: false,
    rights: false,
    retention: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAccept = () => {
    if (!dataProcessing) {
      Alert.alert(
        "Consentement requis",
        "Vous devez accepter le traitement de vos données pour utiliser l'application"
      );
      return;
    }

    // Sauvegarder les consentements (sera intégré avec AuthContext)
    Alert.alert(
      "Consentements enregistrés",
      "Vos préférences ont été enregistrées avec succès",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const SectionHeader = ({
    title,
    sectionKey,
  }: {
    title: string;
    sectionKey: string;
  }) => (
    <Button
      variant="link"
      onPress={() => toggleSection(sectionKey)}
      style={styles.sectionHeader}
    >
      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.chevron}>
          {expandedSections[sectionKey] ? "▼" : "▶"}
        </Text>
      </View>
    </Button>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Imara</Text>
          <Text style={styles.subtitle}>Protection de vos données</Text>
        </View>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des consentements RGPD</CardTitle>
            <CardDescription>
              Nous respectons votre vie privée et la protection de vos données
              personnelles
            </CardDescription>
          </CardHeader>

          <CardContent>
            <View style={styles.contentSection}>
              {/* Introduction */}
              <Text style={styles.introText}>
                Conformément au Règlement Général sur la Protection des Données
                (RGPD), nous vous informons sur la collecte et
                l&apos;utilisation de vos données personnelles.
              </Text>

              {/* Expandable Sections */}
              <View style={styles.expandableSections}>
                {/* What Data */}
                <View style={styles.section}>
                  <SectionHeader
                    title="📋 Quelles données collectons-nous ?"
                    sectionKey="whatData"
                  />
                  {expandedSections.whatData && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.bulletPoint}>
                        • Informations d&apos;identification (nom, prénom,
                        email)
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Coordonnées (téléphone, adresse si professionnel)
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Photos de profil et galerie (professionnels)
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Historique de réservations
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Avis et évaluations
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Données de navigation (si analytics activé)
                      </Text>
                    </View>
                  )}
                </View>

                {/* How We Use */}
                <View style={styles.section}>
                  <SectionHeader
                    title="🎯 Comment utilisons-nous vos données ?"
                    sectionKey="howUse"
                  />
                  {expandedSections.howUse && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.bulletPoint}>
                        • Gestion de votre compte et authentification
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Mise en relation avec les professionnels
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Traitement des réservations
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Envoi de notifications liées au service
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Amélioration de nos services (si analytics)
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Communications marketing (avec votre accord)
                      </Text>
                    </View>
                  )}
                </View>

                {/* Your Rights */}
                <View style={styles.section}>
                  <SectionHeader title="⚖️ Vos droits" sectionKey="rights" />
                  {expandedSections.rights && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.bulletPoint}>
                        • <Text style={styles.bold}>Droit d&apos;accès :</Text>{" "}
                        Consulter vos données
                      </Text>
                      <Text style={styles.bulletPoint}>
                        •{" "}
                        <Text style={styles.bold}>
                          Droit de rectification :
                        </Text>{" "}
                        Modifier vos données
                      </Text>
                      <Text style={styles.bulletPoint}>
                        •{" "}
                        <Text style={styles.bold}>
                          Droit à l&apos;effacement :
                        </Text>{" "}
                        Supprimer votre compte
                      </Text>
                      <Text style={styles.bulletPoint}>
                        •{" "}
                        <Text style={styles.bold}>
                          Droit à la portabilité :
                        </Text>{" "}
                        Exporter vos données
                      </Text>
                      <Text style={styles.bulletPoint}>
                        •{" "}
                        <Text style={styles.bold}>
                          Droit d&apos;opposition :
                        </Text>{" "}
                        Refuser certains traitements
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • <Text style={styles.bold}>Droit de limitation :</Text>{" "}
                        Restreindre le traitement
                      </Text>
                    </View>
                  )}
                </View>

                {/* Data Retention */}
                <View style={styles.section}>
                  <SectionHeader
                    title="⏱️ Durée de conservation"
                    sectionKey="retention"
                  />
                  {expandedSections.retention && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.bulletPoint}>
                        • Compte actif : durée illimitée
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Après suppression : 30 jours maximum
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Données de facturation : 10 ans (obligation légale)
                      </Text>
                      <Text style={styles.bulletPoint}>
                        • Vous pouvez demander la suppression à tout moment
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Consent Checkboxes */}
              <View style={styles.consentsSection}>
                <Text style={styles.consentsTitle}>Vos consentements</Text>

                {/* Mandatory */}
                <Checkbox
                  checked={dataProcessing}
                  onPress={() => setDataProcessing(!dataProcessing)}
                >
                  <Text style={styles.checkboxLabel}>
                    <Text style={styles.required}>* </Text>
                    J&apos;accepte le traitement de mes données personnelles
                    conformément à la{" "}
                    <Text style={styles.link}>
                      Politique de confidentialité
                    </Text>
                    {"\n"}
                    <Text style={styles.mandatory}>
                      (Obligatoire pour utiliser l&apos;application)
                    </Text>
                  </Text>
                </Checkbox>

                {/* Optional - Marketing */}
                <Checkbox
                  checked={marketing}
                  onPress={() => setMarketing(!marketing)}
                >
                  <Text style={styles.checkboxLabel}>
                    J&apos;accepte de recevoir des communications marketing et
                    promotionnelles
                    {"\n"}
                    <Text style={styles.optional}>
                      (Optionnel - vous pouvez modifier ce choix à tout moment)
                    </Text>
                  </Text>
                </Checkbox>

                {/* Optional - Analytics */}
                <Checkbox
                  checked={analytics}
                  onPress={() => setAnalytics(!analytics)}
                >
                  <Text style={styles.checkboxLabel}>
                    J&apos;accepte l&apos;utilisation de mes données à des fins
                    analytiques pour améliorer le service
                    {"\n"}
                    <Text style={styles.optional}>(Optionnel - anonymisé)</Text>
                  </Text>
                </Checkbox>
              </View>

              {/* Contact Info */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>
                  Questions ou exercice de vos droits ?
                </Text>
                <Text style={styles.contactText}>
                  Contactez notre DPO (Délégué à la Protection des Données) :
                  {"\n"}📧 <Text style={styles.link}>dpo@imara-app.com</Text>
                </Text>
              </View>
            </View>
          </CardContent>

          <CardFooter>
            <Button
              onPress={handleAccept}
              disabled={!dataProcessing}
              style={styles.fullWidth}
            >
              Enregistrer mes choix
            </Button>

            <Button
              variant="outline"
              style={styles.fullWidth}
              onPress={() => router.back()}
            >
              Retour
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En utilisant Imara, vous acceptez nos{" "}
            <Text style={styles.link}>
              Conditions Générales d&apos;Utilisation
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    gap: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
  },
  contentSection: {
    gap: 24,
  },
  introText: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 22,
  },
  expandableSections: {
    gap: 12,
  },
  section: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#1F1F1F",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  sectionContent: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    gap: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  consentsSection: {
    gap: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  consentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 20,
  },
  required: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  mandatory: {
    fontSize: 12,
    color: "#EF4444",
    fontStyle: "italic",
  },
  optional: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  link: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  contactSection: {
    backgroundColor: "#1F1F1F",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contactText: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 20,
  },
  fullWidth: {
    width: "100%",
  },
  footer: {
    marginTop: 16,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
