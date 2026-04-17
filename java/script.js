// Substitua o 'SUA_URL_DO_GOOGLE_SCRIPT' pela sua URL real
const urlOriginal = 'https://script.google.com/macros/s/AKfycbxZRpkeeNeZPAnAODyNwuiJ0wxOO1BE-bV9X2RWXaykDq9v7zzRPnYZRzlDftx-VhLW/exec'; 
const proxyUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(urlOriginal);

const resposta = await fetch(proxyUrl); // Agora sem o no-cors
const biblioteca = await resposta.json(); // Isso vai funcionar!


// A "Tranca" de login
document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtivo = localStorage.getItem('sessaoAtiva');
    if (!usuarioAtivo && window.location.pathname.includes("projeto.html")) {
        alert("Ops! Você precisa estar logado para ver os livros.");
        window.location.href = "login.html";
    }
    Livros(); // Chama a função aqui
});

async function Livros() {
    const lista = document.getElementById('book-list');
    if (!lista) return;

    try {
        lista.innerHTML = '<p style="color: white; font-family: Varela Round, sans-serif;">Carregando...</p>';
        
        const resposta = await fetch(planilhalivros);
        const biblioteca = await resposta.json();

        lista.innerHTML = '';

        biblioteca.forEach((livro) => {
            const item = document.createElement('li');
            item.className = 'book-item';

            // --- CORREÇÕES NECESSÁRIAS ---
            let s = livro.status || livro.Status || 'disponível';
            let p = livro.prazo || livro.Prazo || '';
            let id = livro.id || livro.ID;
            
            // Definindo as variáveis que estavam faltando
            let capaLimpa = String(livro.capa || livro.Capa || '').trim();
            if (!capaLimpa) capaLimpa = "https://via.placeholder.com/100x150?text=Sem+Capa";
            
            let desc = livro.descricao || livro.Descricao || 'Sem descrição.';
            // -----------------------------

            let statusht = '';
            if (s === 'disponível') {
                statusht = `<button class="btn-pegar" onclick="emprestarLivro('${id}')">Pegar Emprestado</button>`;
            } else {
                statusht = `<span class="indisponivel">Indisponível - Retorno: ${p}</span>`;
            }

            item.innerHTML = `
                <div class="card-livro" style="display: flex; gap: 20px; border-bottom: 1px solid #444; padding: 10px;">
                    <img src="${capaLimpa}" alt="Capa" style="width:100px; height:150px; object-fit: cover; border-radius: 5px;">
                    <div class="info">
                        <div style="display: flex; justify-content: space-between;">
                            <strong style="color: white; font-size: 1.2em;">${livro.titulo || livro.Titulo}</strong>
                            <span style="background: #444; color: #00ff9d; padding: 2px 8px; border-radius: 10px; font-size: 0.7em;">${livro.generol || 'Geral'}</span>
                        </div>
                        <p style="color: #ccc; margin: 5px 0;">${livro.autor || livro.Autor}</p>
                        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">${desc}</p>
                        <div style="display: flex; justify-content: space-between;">
                            ${statusht}
                            <span style="color: #666; font-size: 0.8em;">Estoque: ${livro.quantidade || 1}</span>
                        </div>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });
    } catch (erro) {
        console.error("Erro:", erro);
        lista.innerHTML = '<p style="color: red;">Erro ao carregar livros. Verifique o console.</p>';
    }
}
