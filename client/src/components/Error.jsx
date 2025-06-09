import {useLocation} from 'react-router-dom';

export const Error = () => {
    const location = useLocation();

    return (
        <div>
            <h2>Error</h2>
            <p>{location.state.error || "Unexpected error" }</p>
        </div>
    );
}
