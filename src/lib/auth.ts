
export function getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
}

export function getUsuarioLogado() {
    if (typeof window !== 'undefined') {
        let usuarioStr = localStorage.getItem('usuarioLogado');
        if (!usuarioStr) {
            usuarioStr = localStorage.getItem('usuario');
        }
        return usuarioStr ? JSON.parse(usuarioStr) : null;
    }
    return null;
}

export function getPublicHeaders(): HeadersInit {
    console.log('🔓 Headers públicos - sem token');
    return {
        'Content-Type': 'application/json'
    };
}

export async function publicFetch(url: string, options: RequestInit = {}) {
    const publicOptions = {
        ...options,
        headers: {
            ...getPublicHeaders(),
            ...options.headers
        }
    };

    console.log(`🔓 Fazendo requisição pública para: ${url}`);
    
    try {
        const response = await fetch(url, publicOptions);
        return response;
    } catch (error) {
        console.error(`❌ Erro na requisição pública para ${url}:`, error);
        throw error;
    }
}
export function isLoggedIn(): boolean {
    return !!getToken() && !!getUsuarioLogado();
}

export function forceNewLogin(): void {
    if (typeof window !== 'undefined') {
        console.log('🔄 Forçando novo login...');
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    }
}
export function isAdmin(): boolean {
    const usuario = getUsuarioLogado();
    return usuario ? usuario.isAdmin === true : false;
}

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    }
}

export async function verifyToken(): Promise<boolean> {
    const token = getToken();

    if (!token) {
        return false;
    }

    try {
        const response = await fetch('https://agendou-back-9dr1.vercel.app/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            return true;
        } else {
            console.log('Token inválido no servidor');
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return true;  
    }
}

export function getAuthHeaders(): HeadersInit {
    const token = getToken();
    console.log('🔑 Token sendo enviado:', token ? 'Sim' : 'Não');

    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    } else {
        console.warn('⚠️ Token não encontrado, enviando sem autenticação');
        return {
            'Content-Type': 'application/json'
        };
    }
}

export async function debugToken(): Promise<void> {
    const token = getToken();
    console.log('🐛 DEBUG TOKEN:');
    console.log('- Token no localStorage:', token);
    console.log('- Usuário logado:', getUsuarioLogado());

    if (token) {
        try {
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('- Status da verificação:', response.status);
            console.log('- Resposta da verificação:', await response.text());
        } catch (error) {
            console.log('- Erro na verificação:', error);
        }
    }
}