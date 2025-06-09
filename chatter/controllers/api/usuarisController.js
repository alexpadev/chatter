const debug = require('debug')('chatter:controllers:api:bioController');
const Usuari = require('../../models/Usuari');

const UsuariController = {
    list: async (req, res, next) => {
        debug("List usuaris");
        try {
            let data;
            if (req.query.search && req.query.search.trim() !== "") {
                const query = req.query.search.trim();
                data = await Usuari.find({
                    $or: [
                        { nom: { $regex: query, $options: 'i' } },
                        { cognoms: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                        { descripcio: { $regex: query, $options: 'i' } },
                    ]
                });
            } else {
                data = await Usuari.find({}).sort({ email: 1 });
            }
            res.json(data);
        } catch (error) {
            next(error);
        }
    },

    get: async (req, res, next) => {
        debug("Get usuari: ", req.params.id);
        try {
            const data = await Usuari.findById(req.params.id);
            if (!data) {
                throw new Error("Not found");
            }
            data.avatarReal = data.getAvatarBase64();
            res.json(data);
        } catch (error) {
            res.status(404).json({
                message: error.message
            });
        }
    },

    updateProfile: async (req, res, next) => {
        const userId = req.user.id;
        const { nom, cognoms, email, descripcio, data_naixement, idiomes } = req.body;
        
        try {
            const usuari = await Usuari.findById(userId);
            if (!usuari) {
                return res.status(404).send("Usuari no trobat");
            }
            
            usuari.nom = nom || usuari.nom;
            usuari.cognoms = cognoms || usuari.cognoms;
            usuari.email = email || usuari.email;
            usuari.descripcio = descripcio || usuari.descripcio;
            usuari.data_naixement = data_naixement || usuari.data_naixement;
            usuari.idiomes = idiomes ? idiomes.map(idioma => idioma.trim()) : usuari.idiomes;
    
            await usuari.save();
            res.json({ message: "Usuari actualitzat correctament", usuari });
        } catch (error) {
            console.error(error);
            next(error);
            
        }
    }
};

module.exports = UsuariController;
