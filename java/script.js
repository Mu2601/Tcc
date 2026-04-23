// Use a URL da sua última implantação do Google
const urlGoogle = 'https://script.google.com/macros/s/AKfycbwxsW1BIV_VjjOWl_6QVlSyw9MHXTp-TfELJXE2eGi3AV6mDWsKjiReRjA4fB6EH98/exec'; 
const proxyUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(urlGoogle);

async function carregarBiblioteca() {
    const lista = document.getElementById('book-list');
    if (!lista) return;

    try {
        lista.innerHTML = '<p style="color: white;">Buscando livros...</p>';
        
        const resposta = await fetch(proxyUrl);
        const biblioteca = await resposta.json();

        lista.innerHTML = ''; 

        if (biblioteca.length === 0) {
            lista.innerHTML = '<p style="color: white;">Nenhum livro encontrado.</p>';
            return;
        }

        biblioteca.forEach(livro => {
            const item = document.createElement('li');
            item.className = 'book-item';
            
            // Ajuste os nomes (titulo, capa) para baterem com as colunas da sua planilha
            let nomeLivro = livro.titulo || "Sem título";
            let imagemCapa = livro.capa || "https://via.placeholder.com/100x150";

            item.innerHTML = `
                <div class="card-livro" style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #333;">
                    <img src="${imagemCapa}" style="width: 60px; border-radius: 4px;">
                    <div>
                        <strong style="color: white; display: block;">${nomeLivro}</strong>
                        <button style="margin-top: 5px; background: #00ff9d; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Pegar</button>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });
    } catch (erro) {
        console.error("Erro detalhado:", erro);
        lista.innerHTML = '<p style="color: #ff4d4d;">Erro ao carregar livros. Tente atualizar a página.</p>';
    }
}

// Garante que a função só roda quando o site estiver pronto
window.addEventListener('load', carregarBiblioteca);
