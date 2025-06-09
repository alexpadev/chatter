import { useState, useEffect, useContext, useTransition } from 'react';
import { UserContext } from '../../userContext';
import { useNavigate } from 'react-router-dom';

const MyBios = () => {
  const { apiInstanceRef } = useContext(UserContext);
  const navigate = useNavigate();
  const [bios, setBios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    nom: '',
    url: '',
    tags: '',
    pictures: [],
  });
  const [newPicture, setNewPicture] = useState('');
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState({});

  const loadBios = async () => {
    try {
      const res = await apiInstanceRef.current.get('/bios/mine');
      startTransition(() => {
        setBios(res.data);
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/logout');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPicture = () => {
    if (newPicture.trim()) {
      setFormData(prev => ({
        ...prev,
        pictures: [...prev.pictures, newPicture.trim()],
      }));
      setNewPicture('');
    }
  };

  const removePicture = (index) => {
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imatges: formData.pictures,
      };
      if (editId) {
        const res = await apiInstanceRef.current.put(`/bios/${editId}`, payload);
        const updatedBio = res.data.bio || res.data;
        setBios(bios.map(bio => {
          const id = bio._id || bio.id;
          return id === editId ? updatedBio : bio;
        }));
      } else {
        const res = await apiInstanceRef.current.post('/bios', payload);
        setBios([...bios, res.data.bio]);
      }
      setFormData({ nom: '', url: '', tags: '', pictures: [] });
      setNewPicture('');
      setEditId(null);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (bio) => {
    const id = bio._id || bio.id;
    setEditId(id);
    setFormData({
      nom: bio.nom,
      url: bio.url,
      tags: bio.tags ? bio.tags.join(', ') : '',
      pictures: bio.imatges ? [...bio.imatges] : [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiInstanceRef.current.delete(`/bios/${id}`);
      setBios(bios.filter(bio => (bio._id || bio.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setFormData({ nom: '', url: '', tags: '', pictures: [] });
    setNewPicture('');
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="w-150 bg-white p-6 rounded-md shadow-lg z-50 w-96">
            <h1 className="text-xl text-blue-500 font-bold mb-4">
              {editId ? "Update Bio" : "Create Bio"}
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input 
                  type="text" 
                  name="url" 
                  value={formData.url} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tags (separated by commas)
                </label>
                <input 
                  type="text" 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Pictures (links)
                </label>
                <div className="space-y-2">
                  {formData.pictures.map((pic, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 truncate">{pic}</span>
                      <button
                        type="button"
                        onClick={() => removePicture(idx)}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newPicture}
                    onChange={(e) => setNewPicture(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={addPicture}
                    className="text-xl cursor-pointer bg-green-600 transition hover:bg-green-700 text-white font-bold py-1 px-4 rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="w-1/3 cursor-pointer transition mr-4 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="w-1/1 cursor-pointer bg-blue-500 transition hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center mb-4 ml-3">
        <h1 className="text-xl text-blue-500 font-bold mt-10">My bios</h1>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-800 text-xl text-white mt-10 ml-3 font-bold px-2 cursor-pointer transition rounded-full"
        >
          +
        </button>
      </div>

      {loading || isPending ? (
        <div className="flex items-center justify-center h-32">
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
      ) : bios.length === 0 ? (
        <p>You have no bios.</p>
      ) : (
        <ul className="border border-gray-200 p-4 rounded-md divide-y divide-gray-300">
          {bios.map(bio => {
            const id = bio._id || bio.id;
            return (
              <li key={id} className="py-2 flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className="text-gray-600 font-bold">{bio.nom}</h2>
                  <p className="text-sm text-gray-600">{bio.url}</p>
                  {bio.tags && (
                    <p className="text-sm text-gray-600">
                      Tags: {bio.tags.join(', ')}
                    </p>
                  )}
                  {bio.imatges?.length > 0 && (
                    <div className="mt-2">
                      <button 
                        onClick={() => toggleDropdown(id)}
                        className="text-blue-500 text-sm underline"
                      >
                        {openDropdown[id] ? "Hide Images" : "Show Images"}
                      </button>
                      {openDropdown[id] && (
                        <div className="flex flex-wrap mt-2 gap-2">
                          {bio.imatges.map((pic, idx) => (
                            <a 
                              key={idx} 
                              href={pic} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <img 
                                src={pic} 
                                alt={`Pic ${idx + 1}`} 
                                className="w-16 h-16 object-cover rounded border border-gray-300"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button 
                    onClick={() => handleEdit(bio)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-full transition cursor-pointer"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(id)}
                    className="cursor-pointer transition bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyBios;