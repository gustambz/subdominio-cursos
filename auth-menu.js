// Configurações do Supabase (Mesma credencial usada no Login)
const SUPABASE_URL = "https://lcslqpdoidgteihcxjqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WnJunLw2RbK4yVjkN2r8IA_j_NWO3El";
const COOKIE_DOMAIN = ".meuanalytics.com.br";

// Inicializa o cliente do Supabase com a estratégia de Cookie unificado
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

// Função que gerencia o comportamento visual do cabeçalho
document.addEventListener("DOMContentLoaded", () => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        const navLinks = document.querySelector(".nav-links");
        if (!navLinks) return;

        if (session && session.user) {
            console.log("Supabase: Usuário identificado na carga inicial ->", session.user.id);
            
            // O usuário está logado! Vamos remover o botão "Entrar" e injetar o Avatar + Botão Sair
            const btnLogin = navLinks.querySelector(".btn-login");
            if (btnLogin) btnLogin.remove();

            // Cria o HTML do Avatar (Inicial do e-mail) + Botão Sair
            const userEmail = session.user.email || "U";
            const userLetter = userEmail.charAt(0).toUpperCase();

            const loggedMenu = document.createElement("div");
            loggedMenu.style.display = "flex";
            loggedMenu.style.alignItems = "center";
            loggedMenu.style.gap = "15px";
            loggedMenu.innerHTML = `
                <div class="user-avatar" style="width: 35px; height: 35px; background-color: #e11d48; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.95rem;" title="${userEmail}">
                    ${userLetter}
                </div>
                <button id="btn-logout" style="background: none; border: 1px solid #cbd5e1; color: #64748b; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.85rem; transition: all 0.2s;">
                    Sair
                </button>
            `;

            navLinks.appendChild(loggedMenu);

            // Adiciona o evento de clique no botão Sair (Logout)
            document.getElementById("btn-logout").addEventListener("click", async () => {
                await supabaseClient.auth.signOut();
                console.log("Supabase: Sessão encerrada pelo usuário.");
                window.location.reload(); // Recarrega a página para voltar ao estado anônimo
            });

        } else {
            console.log("Supabase: Usuário Anônimo na carga inicial.");
        }
    });
});
