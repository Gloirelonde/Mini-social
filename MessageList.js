import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Assurez-vous que le chemin est correct

const MessageList = ({ channelId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les messages du canal
  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('content, user_id, created_at')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des messages", error);
    } else {
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [channelId]);

  // Fonction pour publier un message
  const handlePostMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return; // Empêcher la soumission de messages vides

    setLoading(true);

    const user = supabase.auth.user();
    if (!user) {
      alert('Vous devez être connecté pour publier un message.');
      return;
    }

    // Envoi du message à Supabase
    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage, user_id: user.id, channel_id: channelId }]);

    if (error) {
      console.error('Erreur lors de l\'ajout du message', error);
      alert('Erreur lors de la publication du message.');
    } else {
      setNewMessage(''); // Réinitialiser le champ du message
      fetchMessages(); // Rafraîchir la liste des messages
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Messages du canal</h2>

      {/* Liste des messages */}
      <div className="message-list">
        {loading ? (
          <p>Chargement des messages...</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message">
              <p>{message.content}</p>
              <span className="text-sm text-gray-500">{message.created_at}</span>
            </div>
          ))
        )}
      </div>

      {/* Formulaire de publication de message */}
      <form onSubmit={handlePostMessage} className="mt-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          rows="3"
          className="w-full p-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md w-full"
        >
          {loading ? 'Publication en cours...' : 'Publier'}
        </button>
      </form>
    </div>
  );
};

export default MessageList;
