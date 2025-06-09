import { useEffect, useState, useContext, useTransition } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../userContext';

export const Bio = ({ sendNotification }) => {
  const { id } = useParams();
  const { apiInstanceRef, user } = useContext(UserContext);
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [kissCount, setKissCount] = useState(0);
  const [isKissed, setIsKissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data._id) {
      loadKisses();
    }
  }, [data._id]);

  const loadData = async () => {
    try {
      const res = await apiInstanceRef.current.get(`/bios/${id}`);
      console.log("SUCCESS", res.data);
      startTransition(() => {
        setData(res.data);
      });
    } catch (err) {
      console.log("ERROR", err);
      if (err.response?.status === 401) {
        navigate("/logout");
      } else {
        const message = err.response?.data.message || err.message;
        navigate("/error", { state: { error: message } });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadKisses = async () => {
    try {
      const res = await apiInstanceRef.current.get(`/kiss/bio/${id}`);
      console.log("Kisses response", res.data);
      setKissCount(res.data.count);
      if (user && res.data.fromEmails.includes(user.email)) {
        setIsKissed(true);
      } else {
        setIsKissed(false);
      }
    } catch (err) {
      console.log("Error loading kisses", err);
    }
  };

  const handleKiss = async () => {
    try {
      if (!isKissed) {
        await apiInstanceRef.current.post('/kiss', {
          fromEmail: user.email,
          targetBio: id
        });
        setIsKissed(true);
        setKissCount(prev => prev + 1);
      } else {
        await apiInstanceRef.current.delete('/kiss', {
          data: {
            fromEmail: user.email,
            targetBio: id
          }
        });
        setIsKissed(false);
        setKissCount(prev => prev - 1);
      }
      sendNotification(data.autor.email, `Your bio "${data.nom}" has been ${isKissed ? "unkissed" : "kissed"} by ${user.email}!!!`);
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
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-1 text-blue-500">{data.nom || "No name provided"}</h1>
        <p className="text-gray-500 mb-2">{data.url || "No URL provided"}</p>
        {data.tags && data.tags.length > 0 ? (
          <p className="text-gray-800 mb-2">
            Tags: {data.tags.join(', ')}
          </p>
        ) : (
          <p className="text-gray-800 mb-2">No tags available</p>
        )}
        <p className="text-gray-800">{data.descripcio || "No description provided"}</p>

        {data.imatges && data.imatges.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.imatges.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Image ${index + 1}`}
                className="object-cover w-full h-40 rounded"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-800 mt-4">No images available</p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleKiss}
            className="bg-pink-500 hover:bg-pink-700 text-white text-sm font-bold py-2 px-4 rounded-full"
          >
            {isKissed ? "Unkiss" : "Kiss"}
          </button>
          <span className="text-gray-700"><strong>Kisses:</strong> {kissCount}</span>
        </div>
        <div className="mt-4">
          <Link to="/bios" className="text-blue-500 hover:text-blue-700 transition-colors">
            &larr; Back to bios list
          </Link>
        </div>
      </div>
    </div>
  );
};
