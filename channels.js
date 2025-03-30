import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase"; // Assurez-vous que le chemin est correct

const Channels = () => {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null); // Stocke l'utilisateur connecté
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState(null); // Pour l'aperçu de l'image avant téléchargement

  // Récupérer l'utilisateur connecté dès le chargement
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      } else if (user) {
        console.log("Utilisateur récupéré :", user);
        setUser(user);
        fetchProfileImage(user.id);
      }
    };
    fetchUser();
  }, []);

  // Récupérer l'image de profil
  const fetchProfileImage = async (userId) => {
    const { data, error } = await supabase
      .storage
      .from('profiles')
      .getPublicUrl(`${userId}/profile.jpg`);
    if (error) {
      console.error("Erreur de récupération de l'image de profil :", error);
    } else {
      setProfileImageUrl(data.publicUrl);
    }
  };

  // Fonction pour publier un message
  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      alert("Vous devez être connecté pour publier un message.");
      return;
    }
    setLoading(true);
    console.log("ID utilisateur avant insertion :", user.id);
    const { error: insertError } = await supabase.from('posts').insert([
      { content, user_id: user.id },
    ]);
    if (insertError) {
      alert("Erreur de publication : " + insertError.message);
    } else {
      setContent('');
      fetchPosts();
    }
    setLoading(false);
  };

  // Fonction pour récupérer les messages
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      alert("Erreur de récupération des messages : " + error.message);
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  // Fonction pour uploader l'image de profil
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;
      // Afficher un aperçu de l'image localement
      setPreviewImage(URL.createObjectURL(file));
      console.log("Début du téléchargement de l'image...");
      const allowedExtensions = ["jpg", "jpeg", "png"];
      if (!allowedExtensions.includes(fileExt)) {
        alert("Veuillez télécharger une image au format JPG ou PNG.");
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .storage
          .from('profiles')
          .upload(filePath, file);
        if (error) {
          console.error("Erreur de téléchargement de l'image :", error);
          alert("Erreur lors du téléchargement de l'image : " + error.message);
        } else {
          console.log("Image téléchargée avec succès", data);
          const { data: { publicUrl }, error: urlError } = supabase
            .storage
            .from('profiles')
            .getPublicUrl(filePath);
          if (urlError) {
            alert("Erreur lors de la récupération de l'URL de l'image.");
          } else {
            setProfileImageUrl(publicUrl);
          }
        }
      } catch (err) {
        console.error("Erreur inattendue lors du téléchargement de l'image :", err);
        alert("Erreur inattendue lors du téléchargement de l'image : " + err.message);
      }
      setLoading(false);
    } else {
      console.error("Aucun fichier sélectionné.");
      alert("Veuillez sélectionner un fichier d'image.");
    }
  };

  // Fonction pour supprimer un message
  const handleDeletePost = async (postId) => {
    if (!user) {
      alert("Vous devez être connecté pour supprimer un message.");
      return;
    }
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);
    if (error) {
      alert("Erreur lors de la suppression du message : " + error.message);
    } else {
      console.log("Message supprimé avec succès");
      fetchPosts();
    }
  };

  // Fonction pour modifier un message
  const handleEditPost = async (postId, newContent) => {
    if (!user) {
      alert("Vous devez être connecté pour modifier un message.");
      return;
    }
    const { error } = await supabase
      .from('posts')
      .update({ content: newContent })
      .eq('id', postId)
      .eq('user_id', user.id);
    if (error) {
      alert("Erreur lors de la modification du message : " + error.message);
    } else {
      console.log("Message modifié avec succès");
      fetchPosts();
    }
  };

  // Récupérer les messages au chargement
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Publier un message</h2>
      <form onSubmit={handlePostMessage} className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Écris ton message..."
          rows="4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Chargement..." : "Publier"}
        </button>
      </form>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Prévisualisation de l'image"
              className="w-full h-full object-cover"
            />
          ) : profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Image de profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-white">Pas d'image</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleProfileImageUpload}
          className="ml-4 border p-2 rounded"
          disabled={loading}
        />
      </div>
      <h3 className="text-xl font-semibold mb-4">Messages</h3>
      {loading ? (
        <p>Chargement des messages...</p>
      ) : (
        <div>
          {posts.length === 0 ? (
            <p>Aucun message pour le moment.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border p-4 mb-2">
                <p>{post.content}</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
                <div className="mt-2">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => {
                      const newContent = prompt("Modifier le message :", post.content);
                      if (newContent && newContent.trim() !== "" && newContent !== post.content) {
                        handleEditPost(post.id, newContent);
                      }
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Channels;
