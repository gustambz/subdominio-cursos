// auth-menu.js - Atualizado e unificado com suporte ao Data Layer (User-ID)
const SUPABASE_URL = "https://lcslqpdoidgteihcxjqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WnJunLw2RbK4yVjkN2r8IA_j_NWO3El";
const COOKIE_DOMAIN = ".meuanalytics.com.br";

const supabaseOptions = {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: {
            getItem: (key) => {
                const value = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
                if (value) return decodeURIComponent(value.pop());
                return localStorage.getItem(key);
            },
            setItem: (key, value) => {
                document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=${COOKIE_DOMAIN}; max-age=31536000; SameSite=Lax; Secure`;
                localStorage.setItem(key, value);
            },
            removeItem: (key) => {
                document.cookie = `${key}=; path=/; domain=${COOKIE_DOMAIN}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                localStorage.removeItem(key);
            }
        }
    }
};

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, supabaseOptions);

// 1. EXECUÇÃO IMEDIATA DA IDENTIDADE (Mitiga condição de corrida com o GTM)
supabaseClient.auth.getSession().then(({ data: { session } }) => {
    window.dataLayer = window.dataLayer || [];

    if (session && session.user) {
        // Envia o User-ID para o dataLayer imediatamente
        window.dataLayer.push({
            'user_id': session.user.id
        });
        console.log("Supabase (Subdomínio): Usuário identificado na carga inicial ->", session.user.id);
        
        // Passa a sessão para a função que cuidará da parte visual do menu
        executarLayoutMenu(session);
    } else {
        window.dataLayer.push({
            'user_id': null
        });
        console.log("Supabase (Subdomínio): Usuário Anônimo na carga inicial.");
    }
}).catch((error) => {
    console.error("Erro na verificação inicial do Supabase no subdomínio:", error);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'user_id': null });
});

// 2. FUNÇÃO DEDICADA PARA MANIPULAÇÃO VISUAL DO MENU
function ejecutarLayoutMenu(session) {
    const alterarDOM = () => {
        const navMenu = document.querySelector(".nav-menu"); 
        if (!navMenu) return;

        // Esconde o botão Entrar (não remove para não deslocar o layout)
        const btnLogin = navMenu.querySelector(".btn-login");
        if (btnLogin) btnLogin.style.display = "none"; 

        const userEmail = session.user.email || "U";
        const userLetter = userEmail.charAt(0).toUpperCase();

        // Cria o wrapper do perfil
        const profileWrapper = document.createElement("div");
        profileWrapper.style.position = "relative";
        profileWrapper.style.display = "inline-flex";
        profileWrapper.style.alignItems = "center";
        profileWrapper.style.marginLeft = "10px";
        
        profileWrapper.innerHTML = `
            <div id="avatar-trigger" style="width: 35px; height: 35px; background-color: #ff2a43; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; font-size: 14px; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.2);" title="${userEmail}">
                ${userLetter}
            </div>
            <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 120%; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); min-width: 80px; z-index: 9999;">
                <button id="btn-logout" style="width: 100%; background: none; border: none; color: #334155; cursor: pointer; font-size: 13px; text-align: center; padding: 8px; font-weight: 500;">
                    Sair
                </button>
            </div>
        `;
        
        navMenu.appendChild(profileWrapper);

        // Evento para abrir/fechar o dropdown
        document.getElementById("avatar-trigger").addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = document.getElementById("user-dropdown");
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        });

        // Fecha ao clicar fora
        document.addEventListener("click", () => {
            const menu = document.getElementById("user-dropdown");
            if (menu) menu.style.display = "none";
        });

        // Evento de Logout funcional
        document.getElementById("btn-logout").addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
        });
    };

    // Se o DOM já tiver carregado, executa na hora; senão, aguarda o evento
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", alterarDOM);
    } else {
        alterarDOM();
    }
}
