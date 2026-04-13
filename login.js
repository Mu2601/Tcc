const BIN_ID = "69c18028aa77b81da91073b4";
const API_KEY = "$2a$10$HlWFXgpewEvHtJtmyTpul.VLDNJ/k24VjnJpzZY7P/ToAX5PWh4Cq"; // Começa com $2b$ geralmente
const URL_JSONBIN = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// FUNÇÃO PARA CRIAR CONTA
async function cadastrar() {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('senha').value;

    if (!user || !pass) return alert("Falta algo!");

    try {
        // 1. Pegar a lista atual de usuários na nuvem
        const res = await fetch(URL_JSONBIN, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await res.json();
        let listaUsuarios = data.record.usuarios || [];

        // 2. Verificar se o usuário já existe
        if (listaUsuarios.find(u => u.nome === user)) {
            return alert("Este usuário já existe!");
        }

        // 3. Adicionar o novo e salvar de volta
        listaUsuarios.push({ nome: user, senha: pass });
        
        await fetch(URL_JSONBIN, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ usuarios: listaUsuarios })
        });

        alert("Conta criada na nuvem! Agora você pode logar em qualquer lugar.");
    } catch (e) {
        alert("Erro ao conectar com a nuvem.");
    }
}

// FUNÇÃO PARA LOGAR
async function logar() {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('senha').value;

    try {
        const res = await fetch(URL_JSONBIN, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await res.json();
        const lista = data.record.usuarios || [];

        const encontrado = lista.find(u => u.nome === user && u.senha === pass);

        if (encontrado) {
            localStorage.setItem('sessaoAtiva', user);
            window.location.href = "projeto.html";
        } else {
            alert("Usuário ou senha incorretos!");
        }
    } catch (e) {
        alert("Erro no login.");
    }
}