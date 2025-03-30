import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Gestion des erreurs d'authentification
  const [loading, setLoading] = useState(false);  // Gestion de l'état de chargement
  const router = useRouter();  // Utilisation du router pour rediriger après l'authentification

  const handleLogin = async (type, email, password) => {
    setErrorMessage('');  // Réinitialisation de l'erreur à chaque tentative
    setLoading(true);  // Mise à jour de l'état de chargement

    try {
      let response;

      if (type === 'LOGIN') {
        response = await supabase.auth.signInWithPassword({ email, password });
      } else {
        response = await supabase.auth.signUp({ email, password });
      }

      const { error, data } = response;

      if (error) {
        setErrorMessage(`Erreur d'authentification : ${error.message}`);
      } else if (type === 'SIGNUP') {
      } else {
        router.push('/channels');  // Rediriger l'utilisateur après la connexion réussie
      }
    } catch (error) {
      setErrorMessage(error.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setLoading(false);  // Retirer l'état de chargement après l'opération
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-r from-teal-500 to-indigo-500">
      <div className="w-full sm:w-1/2 xl:w-1/3 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Authentification</h2>
        
        <div className="mb-4">
          <label className="font-semibold text-gray-700 block mb-2">Email</label>
          <input
            type="email"
            className="block w-full bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Votre Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="font-semibold text-gray-700 block mb-2">Mot de passe</label>
          <input
            type="password"
            className="block w-full bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}

        <div className="flex flex-col gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogin('SIGNUP', username, password);
            }}
            className="bg-indigo-700 text-white py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'S\'inscrire'}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogin('LOGIN', username, password);
            }}
            className="bg-white border-2 border-indigo-700 text-indigo-700 py-3 px-6 rounded-lg shadow-md hover:bg-indigo-100 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
