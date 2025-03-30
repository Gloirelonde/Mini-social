import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase"; // Assurez-vous que le chemin est correct

const Profile = () => {
  const [image, setImage] = useState(null); // État pour stocker l'image téléchargée
  const [profileImageUrl, setProfileImageUrl] = useState(""); // URL de l'image de profil
  const [loading, setLoading] = useState(false); // État de chargement

  // Récupérer l'image de profil à l'initialisation
  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = supabase.auth.user();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("profile_image_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur de récupération de l'image de profil :", error);
        } else {
          setProfileImageUrl(data.profile_image_url); // Mettre à jour l'URL de l'image de profil
        }
      }
    };

    fetchProfileImage();
  }, []);

  // Fonction pour télécharger l'image de profil
  const uploadProfileImage = async () => {
    if (!image) return;

    setLoading(true);

    const user = supabase.auth.user();
    const fileExt = image.name.split(".").pop(); // Extension de fichier (ex: jpg, png)
    const filePath = `avatars/${user.id}.${fileExt}`; // Chemin unique pour l'image

    // Télécharger l'image dans Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, image);

    setLoading(false);

    if (error) {
      alert("Erreur de téléchargement : " + error.message);
    } else {
      // Récupérer l'URL publique de l'image téléchargée
      const { publicURL, error: urlError } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlError) {
        alert("Erreur lors de la récupération de l'URL de l'image.");
        return;
      }

      // Mettre à jour l'URL de l'image dans la base de données (table 'users')
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_image_url: publicURL })
        .eq("id", user.id);

      if (updateError) {
        alert("Erreur de mise à jour de l'image de profil : " + updateError.message);
      } else {
        setProfileImageUrl(publicURL); // Mettre à jour l'URL dans le state
        alert("Image de profil mise à jour avec succès !");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Télécharger une image de profil</h2>

      {/* Affichage de l'image de profil si elle existe */}
      {profileImageUrl && (
        <div className="mb-4">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
        </div>
      )}

      {/* Champ pour télécharger une nouvelle image */}
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])} // Mettre l'image dans l'état
        className="border p-2 w-full mb-2"
      />
      
      {/* Bouton pour télécharger l'image */}
      <button
        className={`bg-blue-500 text-white p-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={uploadProfileImage}
        disabled={loading} // Désactiver le bouton pendant le chargement
      >
        {loading ? "Téléchargement en cours..." : "Télécharger"}
      </button>
    </div>
  );
};

export default Profile;
