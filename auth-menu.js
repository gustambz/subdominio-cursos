// Configurações do Supabase
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

document.addEventListener("DOMContentLoaded", () => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        const navLinks = document.querySelector(".nav-menu"); // Garantir que busca o container correto
        if (!navLinks) return;

        if (session && session.user) {
            const btnLogin = navLinks.querySelector(".btn-login");
            if (btnLogin) btnLogin.style.display = "none"; // Esconde, não remove, para não quebrar o layout

            const userEmail = session.user.email || "U";
            const userLetter = userEmail.charAt(0).toUpperCase();

            // Cria o wrapper do perfil
            const profileWrapper = document.createElement("div");
            profileWrapper.style.position = "relative";
            profileWrapper.style.display = "inline-flex";
            profileWrapper.style.alignItems = "center";
            profileWrapper.style.marginLeft = "10px";
            
            profileWrapper.innerHTML = `
                <div id="avatar-trigger" style="width: 35px; height: 35px; background-color: #ff2a43; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; font-size: 14px; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.2);">
                    ${userLetter}
                </div>
                <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 120%; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); min-width: 80px; z-index: 9999;">
                    <button id="btn-logout" style="width: 100%; background: none; border: none; color: #334155; cursor: pointer; font-size: 13px; text-align: center; padding: 8px; font-weight: 500;">
                        Sair
                    </button>
                </div>
            `;
            
            navLinks.appendChild(profileWrapper);

            // Toggle do dropdown
            document.getElementById("avatar-trigger").addEventListener("click", (e) => {
                e.stopPropagation();
                const menu = document.getElementById("user-dropdown");
                menu.style.display = menu.style.display === "none" ? "block" : "none";
            });

            // Fechar ao clicar fora
            document.addEventListener("click", () => {
                const menu = document.getElementById("user-dropdown");
                if (menu) menu.style.display = "none";
            });

            // Ação de Logout
            document.getElementById("btn-logout").addEventListener("click", async () => {
                await supabaseClient.auth.signOut();
                window.location.reload();
            });
        }
    });
});
