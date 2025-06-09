import { useEffect, useState, useContext, useTransition } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../userContext';

export const Usuari = ({ sendNotification }) => {
  const { id } = useParams();
  const { apiInstanceRef, user } = useContext(UserContext);
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [kissCount, setKissCount] = useState(0);
  const [kissEmails, setKissEmails] = useState([]);
  const [isKissed, setIsKissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data.email) {
      loadKisses();
    }
  }, [data.email]);

  const loadData = async () => {
    try {
      const res = await apiInstanceRef.current.get(`/usuaris/${id}`);
      console.log("SUCCESS", res.data);
      startTransition(() => {
        setData(res.data);
      });
    } catch (err) {
      console.log("ERROR", err);
      if (err.response.status === 401) {
        console.log('Unauthorized');
        navigate("/logout");
      } else {
        const message = err.response.data.message || err.message;
        console.log("ERROR", message);
        navigate("/error", { state: { error: message } });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadKisses = async () => {
    try {
      const res = await apiInstanceRef.current.get(`/kiss/user/${data.email}`);
      console.log("Kisses response", res.data);
      setKissCount(res.data.count);
      setIsKissed(res.data.fromEmails.includes(user.email));
      setKissEmails(res.data.fromEmails);
    } catch (err) {
      console.log("Error loading kisses", err);
    }
  };

  const handleKiss = async () => {
    try {
      if (!isKissed) {
        await apiInstanceRef.current.post('/kiss', {
          fromEmail: user.email,
          targetEmail: data.email
        });
        setIsKissed(true);
        setKissCount(prev => prev + 1);
        setKissEmails(prev => [...prev, user.email]);
      } else {
        await apiInstanceRef.current.delete('/kiss', {
          data: {
            fromEmail: user.email,
            targetEmail: data.email
          }
        });
        setIsKissed(false);
        setKissCount(prev => prev - 1);
        setKissEmails(prev => prev.filter(email => email !== user.email));
      }
      sendNotification(data.email, `You have been ${isKissed ? "unkissed" : "kissed"} by ${user.email}!!!`);
    } catch (error) {
      console.error("Error when toggling kiss:", error);
    }
  };

  if (loading || isPending) {
    return (
      <div className="flex items-center justify-center">
        <svg
          className="animate-spin h-10 w-10 text-blue-500 mt-8 mb-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-15 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 relative border-gray-300 border">
        {user && user.email !== data.email && (
          <button
            onClick={handleKiss}
            className="absolute top-6 right-6 cursor-pointer transition bg-pink-500 hover:bg-pink-700 text-white text-sm font-bold py-2 px-3 rounded-full flex items-center"
          >
            {!isKissed ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="white"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" 
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6" 
                fill="white" 
                viewBox="0 0 24 24" 
                stroke="white"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" 
                />
              </svg>
            )}
            <span className="ml-1">{kissCount}</span>
          </button>
        )}
        <div className="flex items-center">
          <div className="mr-8 w-48 h-48 overflow-hidden">
            {data.avatar ? (
              <div className="w-full h-full flex items-center justify-center">

              <img
                src={`data:image/jpeg;base64,${data.avatar}`}
                alt="User Avatar"
                className="object-fit"
              />
            </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-blue-500">
              {data.nom} {data.cognoms}
            </h1>
            <p className="text-gray-500 mb-2">{data.email}</p>
            <p className="text-gray-800 mb-2">
              {data.idiomes ? data.idiomes.join(', ') : ''}
            </p>
            <p className="text-black mb-2 text-sm">{data.descripcio}</p>
            <button
              onClick={() => setShowPopup(true)}
              className="font-bold text-pink-500 cursor-pointer hover:text-pink-800 transition-colors"
            >
              Kissers
            </button>
           
          </div>
        </div>
        <div className="mt-4">
          <Link
            to="/usuaris"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            &larr; Back to users list
          </Link>
        </div>
      </div>

      {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div 
      className="absolute inset-0 bg-black opacity-50"
      onClick={() => setShowPopup(false)}
    ></div>
    <div className="bg-white p-6 rounded-md shadow-lg z-50 w-96 relative">
      <button 
        onClick={() => setShowPopup(false)}
        className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl transition cursor-pointer font-bold"
      >
        &times;
      </button>
      <h1 className="text-xl text-blue-500 font-bold mb-4">Kissers:</h1>
      <ul className="list-disc max-h-60 overflow-y-auto space-y-2">
        {kissEmails.map((email, index) => (
          <li key={index} className="text-gray-700">{email}</li>
        ))}
      </ul>
    </div>
  </div>
)}


    </div>
  );
};
