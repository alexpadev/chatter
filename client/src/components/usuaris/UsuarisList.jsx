import { useEffect, useState, useContext, useTransition } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { UserContext } from '../../userContext';

const KissButton = ({ sendNotification, targetEmail, currentUserEmail, apiInstanceRef, originalKissed }) => {
  const [isKissed, setIsKissed] = useState(originalKissed);

  const handleClick = async () => {
    try {
      if (!isKissed) {
        await apiInstanceRef.current.post('/kiss', {
          fromEmail: currentUserEmail,
          targetEmail: targetEmail
        });
        setIsKissed(true);
      } else {
        await apiInstanceRef.current.delete('/kiss', {
          data: {
            fromEmail: currentUserEmail,
            targetEmail: targetEmail
          }
        });
        setIsKissed(false);
      }
      sendNotification(targetEmail, `You have been ${isKissed ? "unkissed" : "kissed"} by ${currentUserEmail}!!!`);
    } catch (error) {
      console.error("Error when toggling kiss:", error);
    }
  };

  const label = isKissed ? "Unkiss" : "Kiss";

  return (
    <button
      onClick={handleClick}
      className="bg-pink-500 hover:bg-pink-700 text-white text-sm font-bold py-2 px-4 rounded-full"
    >
      {label}
    </button>
  );
};

export const UsuarisList = ({ sendNotification }) => {
  const { apiInstanceRef, user } = useContext(UserContext);
  const { searchQuery } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (apiInstanceRef && apiInstanceRef.current) {
      loadData();
    }
  }, [searchQuery, apiInstanceRef]);

  const loadData = async () => {
    try {
      let url = "/usuaris";
      if (searchQuery && searchQuery.trim() !== "") {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      if (!apiInstanceRef || !apiInstanceRef.current) return;
      const res = await apiInstanceRef.current.get(url);
      console.log("SUCCESS", res.data);

      let kisses = await apiInstanceRef.current.get(`/kiss`);
      console.log("kisses", kisses.data.kisses);
      for (let userItem of res.data) {
        userItem.kissed = kisses.data.kisses.some(kiss => kiss.targetEmail === userItem.email);
      }

      startTransition(() => {
        setData(res.data);
      });
    } catch (err) {
      console.log("ERROR", err);
      if (err.response && err.response.status === 401) {
        console.log('Unauthorized');
        navigate("/logout");
      } else {
        const message = err.response?.data?.message || err.message;
        console.log("ERROR", message);
        navigate("/error", { state: { error: message } });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || isPending) {
    return (
      <div className="flex items-center justify-center mt-16 mb-16">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
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

  if (data.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p className="text-center text-gray-500">No results found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-screen">
      <ul className="border border-gray-300 bg-white shadow rounded-lg divide-y divide-gray-300">
        {data.map(usuari => (
          <li key={usuari.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
            {usuari.avatar ? (
              <img
                src={`data:image/jpeg;base64,${usuari.avatar}`}
                alt="User Avatar"
                className="w-12 h-12 mr-8"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center border-2 border-gray-300 rounded mr-4">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
            )}
              <div>
                <Link 
                  to={`/usuaris/${usuari.id}`} 
                  className="block text-lg font-semibold text-blue-500 hover:text-blue-800 transition-colors"
                >
                  {usuari.nom} {usuari.cognoms}
                </Link>
                <p className="text-sm text-gray-500">{usuari.email}</p>
              </div>
            </div>
            <div className="flex gap-4">
              {user && user.email !== usuari.email && (
                <KissButton
                  targetEmail={usuari.email}
                  currentUserEmail={user.email}
                  apiInstanceRef={apiInstanceRef}
                  sendNotification={sendNotification}
                  originalKissed={usuari.kissed}
                />
              )}
              <Link 
                to={`/usuaris/${usuari.id}`}
                className="bg-blue-500 hover:bg-blue-800 transition text-white text-sm font-bold py-2 px-4 rounded-full"
              >
                View details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
