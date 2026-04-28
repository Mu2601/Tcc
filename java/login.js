const BIN_ID = "69c18028aa77b81da91073b4";
const API_KEY = "$2a$10$HlWFXgpewEvHtJtmyTpul.VLDNJ/k24VjnJpzZY7P/ToAX5PWh4Cq";
const URL_JSONBIN = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function cadastrar() {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('senha').value;

    if (!user || !pass) return alert("Preencha tudo!");

    try {
        const res = await fetch(URL_JSONBIN, { headers: { "X-Master-Key": API_KEY } });
        const data = await res.json();
        let listaUsuarios = data.record.usuarios || [];

        if (listaUsuarios.find(u => u.nome === user)) return alert("Usuário já existe!");

        // ITEM 1 & 4: Criando ID único e definindo tipo
        // Dica: O primeiro usuário pode ser admin manualmente no JSONBin
        const novoUsuario = { 
            id: Date.now(), 
            nome: user, 
            senha: pass, 
            tipo: 'comum' 
        };

        listaUsuarios.push(novoUsuario);
        
        await fetch(URL_JSONBIN, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify({ usuarios: listaUsuarios })
        });

        alert("Conta criada!");
    } catch (e) { alert("Erro na nuvem."); }
}

async function logar() {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('senha').value;

    try {
        const res = await fetch(URL_JSONBIN, { headers: { "X-Master-Key": API_KEY } });
        const data = await res.json();
        const lista = data.record.usuarios || [];

        const encontrado = lista.find(u => u.nome === user && u.senha === pass);

        if (encontrado) {
            // Padronizando para 'usuarioLogado' para o script.js entender
            localStorage.setItem('usuarioLogado', JSON.stringify(encontrado));
            window.location.href = "index.html";
        } else {
            alert("Usuário ou senha incorretos!");
        }
    } catch (e) { alert("Erro no login."); }
}
