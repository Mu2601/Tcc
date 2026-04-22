// 1. Configuração das URLs
const urlGoogle = 'https://script.google.com/macros/s/AKfycbxzsW1BIV_VjjOWl_6QVlSyw9MHXTp-TfELJXE2eGi3AV6mDWsKjiReRjA4fB6EH98/exec'; 
const proxyUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(urlGoogle);

// 2. Controle de Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado (opcional, dependendo da página)
    const usuarioAtivo = localStorage.getItem('sessaoAtiva');
    
    // Se estiver na página de administração ou projeto, pode validar aqui
    // Por enquanto, vamos focar em carregar os livros
    Livros(); 
});

// 3. Função Principal para buscar e exibir os livros
async function Livros() {
    const lista = document.getElementById('book-list');
    if (!lista) return;

    try {
        lista.innerHTML = '<p style="color: white; font-family: Varela Round, sans-serif;">Carregando biblioteca...</p>';
        
        const resposta = await fetch(proxyUrl);
        const biblioteca = await resposta.json();

        lista.innerHTML = ''; // Limpa o "Carregando..."

        if (!biblioteca || biblioteca.length === 0) {
            lista.innerHTML = '<p style="color: white;">Nenhum livro disponível no momento.</p>';
            return;
        }

        biblioteca.forEach((livro) => {
            const item = document.createElement('li');
            item.className = 'book-item';
            
            // Pega os dados (ajustado para os nomes que definimos no Apps Script)
            let titulo = livro.titulo || "Título Indisponível";
            let autor = livro.autor || "Autor desconhecido";
            let capa = livro.capa || "https://via.placeholder.com/100x150?text=Sem+Capa";
            let desc = livro.descricao || "Sem descrição disponível.";
            let genero = livro.generol || "Geral";

            item.innerHTML = `
                <div class="card-livro" style="display: flex; gap: 20px; border-bottom: 1px solid #444; padding: 15px;">
                    <img src="${capa}" alt="Capa" style="width:100px; height:150px; object-fit: cover; border-radius: 5px;">
                    <div class="info">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: white; font-size: 1.2em;">${titulo}</strong>
                            <span style="background: #444; color: #00ff9d; padding: 2px 8px; border-radius: 10px; font-size: 0.7em;">${genero}</span>
                        </div>
                        <p style="color: #ccc; margin: 5px 0;">${autor}</p>
                        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">${desc}</p>
                        <button class="btn-pegar" style="background: #00ff9d; color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            Pegar Emprestado
                        </button>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar livros:", erro);
        lista.innerHTML = '<p style="color: #ff4d4d;">Erro ao carregar os livros. Verifique a conexão com a planilha.</p>';
    }
}
