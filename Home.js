import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabase'  // Assurez-vous que le chemin est correct

const Home = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')  // Gestion des erreurs d'authentification
  const [loading, setLoading] = useState(false)  // Gestion de l'état de chargement
  const router = useRouter()  // Utilisation du router pour rediriger après l'authentification

  // Fonction de connexion / inscription
  const handleLogin = async (type, username, password) => {
    setErrorMessage('')  // Réinitialisation de l'erreur
    setLoading(true)

    try {
      const { error, data: { user } } =
        type === 'LOGIN'
          ? await supabase.auth.signInWithPassword({ email: username, password })
          : await supabase.auth.signUp({ email: username, password })

      if (error) {
        setErrorMessage('Error with auth: ' + error.message)
      } else if (user) {
        setErrorMessage('');
        alert('Authentication successful!')
        router.push('/profile')  // Redirection vers la page du profil après la connexion
      } else {
        alert('Signup successful, confirmation mail should be sent soon!')
      }
    } catch (error) {
      console.log('error', error)
      setErrorMessage(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center p-4 bg-gray-300">
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg bg-white">
          {/* Formulaire de connexion */}
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Email</label>
            <input
              type="text"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Password</label>
            <input
              type="password"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Affichage des erreurs d'authentification */}
          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleLogin('SIGNUP', username, password)
              }}
              className="bg-indigo-700 hover:bg-teal text-white py-2 px-4 rounded text-center transition duration-150 hover:bg-indigo-600 hover:text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign up'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleLogin('LOGIN', username, password)
              }}
              className="border border-indigo-700 text-indigo-700 py-2 px-4 rounded w-full text-center transition duration-150 hover:bg-indigo-700 hover:text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
