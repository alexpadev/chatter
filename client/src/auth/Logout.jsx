import { useContext, useEffect } from 'react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
    let { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Logout!');
        navigate('/');

        return () => {
            //quan es surt d'aquest component, esborra l'usuari
            setUser(null);
        }
    }, [])

    //aquest component no es renderitza, per tant no cal retornar res
    return <></>;
}