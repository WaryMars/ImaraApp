import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import cors from "cors";

// Middleware CORS
const corsHandler = cors({ origin: true });

// Initialise Firebase Admin
admin.initializeApp();

const PINTEREST_API_URL = "https://api.pinterest.com/v5/search/pins";

interface PinterestItem {
  id: string;
  title: string;
  description: string;
  link: string;
  media: {
    images: {
      "600x": { url: string };
      originals: { url: string };
    };
  };
}

export const searchInspiration = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const query = req.body.query as string;

      // Utiliser la variable d'environnement définie par firebase functions:env:set
      const pinterestToken =
        process.env.PINTEREST_TOKEN || process.env.pinterest_token;

      if (!query || !pinterestToken) {
        res
          .status(400)
          .json({ error: "Requête invalide ou configuration manquante." });
        return;
      }

      const response = await axios.get(PINTEREST_API_URL, {
        headers: { Authorization: `Bearer ${pinterestToken}` },
        params: { query: query, page_size: 20 },
      });

      const items = response.data.items
        .map((pin: PinterestItem) => ({
          id: pin.id,
          title: pin.title || pin.description || "Sans titre",
          url:
            pin.media?.images?.["600x"]?.url ||
            pin.media?.images?.["originals"]?.url,
          link: pin.link,
        }))
        .filter((item: { url: string }) => item.url);

      res.status(200).json({ data: items });
    } catch (error: any) {
      console.error("Erreur API Pinterest:", error.message);

      if (error.response?.status === 401) {
        res.status(401).json({
          error:
            "Token Pinterest invalide. Veuillez vérifier la configuration.",
        });
      } else {
        res.status(500).json({ error: "Erreur serveur interne." });
      }
    }
  });
});
