import { useEffect, useState, useContext, useTransition } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { UserContext } from '../../userContext';

const KissButtonForBio = ({ bio, isInitiallyKissed, currentUserEmail, apiInstanceRef, sendNotification }) => {
  const [isKissed, setIsKissed] = useState(isInitiallyKissed);

  const handleClick = async () => {
    try {
      if (!isKissed) {
        await apiInstanceRef.current.post('/kiss', { fromEmail: currentUserEmail, targetBio: bio._id });
      } else {
        await apiInstanceRef.current.delete('/kiss', { data: { fromEmail: currentUserEmail, targetBio: bio._id } });
      }
      setIsKissed(!isKissed);
      sendNotification(bio.autor.email, `Your bio has been ${isKissed ? "unkissed" : "kissed"} by ${currentUserEmail}!`);
    } catch (error) {
      console.error("Error toggling kiss:", error);
    }
  };

  return (
    <button onClick={handleClick} className="bg-pink-500 hover:bg-pink-700 text-white text-sm font-bold py-1 px-3 rounded-full">
      {isKissed ? "Unkiss" : "Kiss"}
    </button>
  );
};

export const BiosList = ({ sendNotification }) => {
  const { apiInstanceRef, user } = useContext(UserContext);
  const { searchQuery } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [kissesMap, setKissesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (apiInstanceRef && apiInstanceRef.current) {
      loadData();
    }
  }, [searchQuery, apiInstanceRef]);

  const loadData = async () => {
    try {
      let url = "/bios";
      if (searchQuery?.trim()) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      
      const [biosRes, kissesRes] = await Promise.all([
        apiInstanceRef.current.get(url),
        apiInstanceRef.current.get("/kiss/bios")
      ]);

      const bios = biosRes.data;
      const allKisses = kissesRes.data.kisses;

      const map = allKisses.reduce((acc, kiss) => {
        if (!acc[kiss.targetBio]) acc[kiss.targetBio] = [];
        acc[kiss.targetBio].push(kiss.fromEmail);
        return acc;
      }, {});

      setKissesMap(map);
      setData(bios);
    } catch (err) {
      console.error("ERROR", err);
      navigate(err.response?.status === 401 ? "/logout" : "/error", { state: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  if (loading || isPending) {
    return <div className="flex items-center justify-center mt-16 mb-16">
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
  </div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-screen">
      <ul className="border border-gray-300 bg-white shadow rounded-lg divide-y divide-gray-300">
        {data.map(bio => (
          <li key={bio._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              {bio.imatges && bio.imatges.length > 0 ? (
                <img
                src={bio.imatges[0]}
                alt="Bio thumbnail"
                className="w-16 h-16 object-cover rounded mr-4"
              />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center border-2 border-gray-300 rounded mr-4">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}

              <div>
                <Link to={`/bios/${bio._id}`} className="block text-lg font-semibold text-blue-500 hover:text-blue-800">
                  {bio.nom}
                </Link>
                <p className="text-sm text-gray-500">{bio.url}</p>
                {bio.tags && <p className="text-sm text-gray-500">Tags: {bio.tags.join(', ')}</p>}
              </div>
            </div>
            {user && (
              <KissButtonForBio
                bio={bio}
                isInitiallyKissed={(kissesMap[bio._id] || []).includes(user.email)}
                currentUserEmail={user.email}
                apiInstanceRef={apiInstanceRef}
                sendNotification={sendNotification}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
