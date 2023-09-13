function generateRandomString(length: number): string {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function base64encode(string: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
}

export async function login(): Promise<void> {
    try {
        const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
        const redirectUri = 'http://localhost:3000';

        const codeVerifier = generateRandomString(128)
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email';

        localStorage.setItem('code_verifier', codeVerifier);

        if (!clientId) {
            console.warn('No client id')
            throw Error('Login failed')
        }

        const args = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        (window as Window).location = 'https://accounts.spotify.com/authorize?' + args;
    } catch (e) {
        throw Error('Login failed')
    }
}



