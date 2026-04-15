  const CLIENT_ID = '1493686411704930304'; 
  const REDIRECT_URI = "https://grupo-giro-bruto-ggb.vercel.app/"; 
  const ID_DA_EMPRESA = '1493000493335838813';

  function navegar(destino) {
    const home = document.getElementById('home-page');
    const dash = document.getElementById('dashboard-page');

    if (!home || !dash) {
        console.error("ERRO: IDs home-page ou dashboard-page não encontradas no HTML!");
        return;
    }

    if (destino === 'perfil' || destino === 'config') {
        home.style.display = 'none';
        dash.style.display = 'block';
        if (typeof showTab === 'function') {
            showTab(destino);
        }
    } else {
        home.style.display = 'block';
        dash.style.display = 'none';
    }

    const menu = document.getElementById("dropdown-menu");
    if (menu) menu.classList.remove("show");
    
    window.scrollTo(0, 0);
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dash-nav a').forEach(l => l.classList.remove('active'));

    document.getElementById('tab-' + tabName).classList.add('active');
    document.getElementById('link-' + tabName).classList.add('active');
}

  window.onload = () => {
    const loginBtn = document.getElementById('login-link');

    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();      
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify+guilds.members.read`;
        console.log("Tentando redirecionar para:", authUrl);
        window.location.href = authUrl;
      });
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token') || localStorage.getItem('discord_token');

    if (accessToken) {
      localStorage.setItem('discord_token', accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      exibirDados(accessToken);
    }
  };

  function exibirDados(token) {
    const loginLink = document.getElementById('login-link');
    const navContainer = document.getElementById('nav-container');

    if (!loginLink || !navContainer) return;

    fetch('https://discord.com/api/users/@me', {
      headers: { authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => {
      if (user.id) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`;
        
        loginLink.outerHTML = `
          <div class="user-dropdown">
            <div class="user-profile-header" onclick="toggleMenu()">
              <img src="${avatarUrl}" class="user-avatar" alt="Avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'>
              <span class="user-name">${user.username}</span>
              <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 5px;"></i>
            </div>
            <div id="dropdown-menu" class="dropdown-content">
              <a href="javascript:void(0)" onclick="navegar('perfil')"><i class="fas fa-user"></i> Perfil</a>
              <a href="javascript:void(0)" onclick="navegar('config')"><i class="fas fa-cog"></i> Config</a>
              <hr style="border: 0; border-top: 1px solid #444; margin: 5px 0;">
              <a href="javascript:void(0)" onclick="logout()" class="logout-item"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
          </div>
        `;

        document.getElementById('user-name-dash').innerText = user.username;
        document.getElementById('user-avatar-dash').src = avatarUrl;

        return fetch(`https://discord.com/guilds/${ID_DA_EMPRESA}/member`, {
          headers: { authorization: `Bearer ${token}` }
        });;
      }
    })
    .then(res => res && res.ok ? res.json() : null)
    .then(member => {
        console.log("Membro carregado:", member);
    })
    .catch(err => {
        console.error("Erro na API do Discord:", err);
        if (err.message.includes('401')) logout();
    });
  }

  function logout() {
    localStorage.removeItem('discord_token');
    window.location.href = window.location.pathname;
  }

  function toggleMenu() {
    document.getElementById("dropdown-menu").classList.toggle("show");
  }

  window.onclick = function(event) {
      if (!event.target.closest('.user-dropdown')) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          for (var i = 0; i < dropdowns.length; i++) {
              var openDropdown = dropdowns[i];
              if (openDropdown.classList.contains('show')) {
                  openDropdown.classList.remove('show');
              }
          }
      }
  }