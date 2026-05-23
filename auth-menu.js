// Configurações do Supabase
const SUPABASE_URL = "https://lcslqpdoidgteihcxjqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WnJunLw2RbK4yVjkN2r8IA_j_NWO3El";
const COOKIE_DOMAIN = ".meuanalytics.com.br";

// Inicializa o cliente do Supabase
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

// Gerencia o cabeçalho
document.addEventListener("DOMContentLoaded", () => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        const navLinks = document.querySelector(".nav-links");
        if (!navLinks) return;

        if (session && session.user) {
            // Remove o botão "Entrar" original
            const btnLogin = navLinks.querySelector(".btn-login");
            if (btnLogin) btnLogin.remove();

            // Cria o menu de perfil com dropdown
            const userEmail = session.user.email || "U";
            const userLetter = userEmail.charAt(0).toUpperCase();

            const profileContainer = document.createElement("div");
            profileContainer.style.position = "relative";
            profileContainer.style.marginLeft = "15px";
            profileContainer.innerHTML = `
                <div id="avatar-trigger" style="width: 38px; height: 38px; background-color: #ff2a43; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" title="${userEmail}">
                    ${userLetter}
                </div>
                <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 45px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); width: 100px; z-index: 1000;">
                    <button id="btn-logout" style="width: 100%; background: none; border: none; color: #1e293b; cursor: pointer; font-size: 14px; text-align: left; padding: 5px;">
                        Sair
                    </button>
                </div>
            `;
            navLinks.appendChild(profileContainer);

            // Evento para abrir/fechar o dropdown
            document.getElementById("avatar-trigger").addEventListener("click", (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById("user-dropdown");
                dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
            });

            // Fecha o dropdown ao clicar em qualquer lugar da tela
            document.addEventListener("click", () => {
                const dropdown = document.getElementById("user-dropdown");
                if (dropdown) dropdown.style.display = "none";
            });

            // Evento de Logout
            document.getElementById("btn-logout").addEventListener("click", async () => {
                await supabaseClient.auth.signOut();
                window.location.reload();
            });

        }
    });
});
