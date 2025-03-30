import { useState } from "react";
import { supabase } from "../utils/supabase"; // Assurez-vous que le chemin est correct

export default function PostMessage() {
  const [content, setContent] = useState(""); // Contenu du message
  const [loading, setLoading] = useState(false); // Etat de chargement

  // Fonction pour soumettre le message
  const handlePostMessage = async () => {
    if (!content.trim()) return; // Ne pas soumettre si le champ est vide

    setLoading(true);

    const user = supabase.auth.user(); // Récupérer l'utilisateur connecté
    if (!user) {
      alert("Vous devez être connecté pour publier un message.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        content: content.trim(),
        created_at: new Date(),
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Erreur lors de la publication du message : " + error.message);
    } else {
      alert("Message publié avec succès !");
      setContent(""); // Réinitialiser le champ de texte après publication
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Publier un message</h2>
      <textarea
        className="border p-2 w-full mb-4 rounded"
        placeholder="Écris ton message ici..."
        rows="4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className={`bg-blue-500 text-white p-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handlePostMessage}
        disabled={loading}
      >
        {loading ? "Publication en cours..." : "Publier"}
      </button>
    </div>
  );
}
