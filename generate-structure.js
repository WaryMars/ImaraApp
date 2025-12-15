// generate-structure.js
const fs = require("fs");
const path = require("path");

// --- Utils ---------------------------------------------------------
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Créé dossier :", dir);
  } else {
    console.log("⚠️ Dossier déjà existant, ignoré :", dir);
  }
}

function createFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "");
    console.log("📄 Créé fichier :", file);
  } else {
    console.log("⚠️ Fichier déjà existant, ignoré :", file);
  }
}

// --- Structure ----------------------------------------------------
const structure = {
  components: {
    review: ["ReviewCard.tsx", "RatingStars.tsx", "ReviewForm.tsx"],
    common: [
      "SearchBar.tsx",
      "FilterChips.tsx",
      "BottomSheet.tsx",
      "ImageUploader.tsx",
    ],
  },

  contexts: ["AuthContext.tsx", "UserContext.tsx", "ThemeContext.tsx"],

  hooks: [
    "useAuth.ts",
    "useFirestore.ts",
    "useBooking.ts",
    "useInspiration.ts",
    "useImagePicker.ts",
  ],

  services: {
    rebase: [
      "auth.service.ts",
      "restore.service.ts",
      "storage.service.ts",
      "notification.service.ts",
    ],
    api: ["pinterest.service.ts", "instagram.service.ts", "quota.service.ts"],
  },

  utils: ["validation.ts", "date.utils.ts", "image.utils.ts"],

  types: [
    "user.types.ts",
    "business.types.ts",
    "booking.types.ts",
    "review.types.ts",
    "inspiration.types.ts",
    "index.ts",
  ],

  constants: ["Colors.ts", "Tags.ts", "Config.ts"],

  config: ["rebase.ts"],

  rootFiles: [], // Si t’en veux tu les mets ici
};

// --- Génération ----------------------------------------------------
function generate(base, obj) {
  for (const key in obj) {
    const value = obj[key];
    const currentPath = path.join(base, key);

    // Si value = array → dossier + fichiers
    if (Array.isArray(value)) {
      createDir(currentPath);
      value.forEach((file) => createFile(path.join(currentPath, file)));
    }

    // Si value = sous-objets → dossier + récursion
    else if (typeof value === "object" && value !== null) {
      createDir(currentPath);
      generate(currentPath, value);
    }

    // Si value = null → fichier simple
    else if (value === null) {
      createFile(currentPath);
    }
  }
}

console.log("🚀 Lancement de la génération...\n");
generate(process.cwd(), structure);

// Fichiers root
structure.rootFiles?.forEach((file) => {
  createFile(path.join(process.cwd(), file));
});

console.log("\n✅ Génération terminée !");
