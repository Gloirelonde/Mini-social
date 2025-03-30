import { useState } from "react";
import { useRouter } from "next/router"; // Import de useRouter pour la redirection
import { supabase } from "../utils/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Pour gérer l'état de chargement
  const [error, setError] = useState(null); // Pour afficher les erreurs
  const router = useRouter(); // Initialisation de useRouter pour la redirection

  async function handleSignUp() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message); // Affichage du message d'erreur
    } else {
      alert("Vérifie ton email pour confirmer ton inscription.");
      router.push("/"); // Redirection après l'inscription
    }
  }

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message); // Affichage du message d'erreur
    } else {
      alert("Connexion réussie !");
      router.push("/channels"); // Redirection après la connexion
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold">Connexion / Inscription</h2>

      {/* Affichage des erreurs */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Affichage du bouton d'inscription et de connexion */}
      <button
        className={`bg-green-500 text-white p-2 rounded w-full mb-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleSignUp}
        disabled={loading}
      >
        {loading ? "Chargement..." : "S'inscrire"}
      </button>
      <button
        className={`bg-blue-500 text-white p-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Se connecter"}
      </button>
    </div>
  );
}
