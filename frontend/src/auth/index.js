import {createAuthProvider} from 'react-token-auth';


export const [useAuth, authFetch, login, logout] =
    createAuthProvider({
        accessTokenKey: 'access_token',
        onUpdateToken: (token) => fetch('http://192.168.1.11:5000/api/login', {
            method: 'POST',
            body: token.access_token
        })
        .then(r => r.json())
    });