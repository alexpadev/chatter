import React, {useState} from "react";
import { UserContext } from "../../userContext";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

export const KissList = () => {

    const API_URL = process.env.API_URL;
    const { id } = useParams();
    const { apiInstanceRef } = useContext(UserContext);
    const [kissList, setKissList] = useState([]);

    const loadKissList = async () => {
        try {
            const res = await apiInstanceRef.current.get(`/usuaris/${id}/kiss`);
            console.log("Kisses response", res.data);
            setKissList(res.data);
        } catch (err) {
            console.log("Error loading kisses", err);
        }
    }

    useEffect(() => {
        loadKissList();
    }
    , []);

    return (
        <div>
        <h1>Kiss List</h1>
        <ul>
            {kissList?.map((kiss, index) => (
                <li key={index}>{kiss.fromEmail}</li>
            ))}

        </ul>
        </div>
    );
    };