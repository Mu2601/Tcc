const API_URL = "https://Muri26.pythonanywhere.com";

// 1. FUNÇÃO PARA CADASTRAR UM NOVO LIVRO
function cadastrarLivro() {
    const livro = {
        id: Date.now(),
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        capa: document.getElementById('capa').value,
        descricao: document.getElementById('descricao').value,
        generol: document.getElementById('generol').value,
        quantidade: document.getElementById('quantidade').value
    };

    if (!livro.titulo || !livro.autor) {
        alert("Por favor, preencha pelo menos o título e o autor.");
        return;
    }

    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livro)
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao salvar no servidor');
        return response.json();
    })
    .then(data => {
        alert("📚 Livro salvo com sucesso!");
        document.getElementById('form-livro').reset();
        listarLivros();
    })
    .catch(error => {
        console.error("Erro no cadastro:", error);
        alert("Erro ao conectar com o servidor.");
    });
}

// 2. FUNÇÃO PARA BUSCAR E EXIBIR OS LIVROS
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(response => response.json())
    .then(livros => {
        const container = document.getElementById('lista-livros');
        if (!container) return;

        container.innerHTML = "";

        if (livros.length === 0) {
            container.innerHTML = "<p style='color: white; text-align: center;'>Nenhum livro cadastrado ainda.</p>";
            return;
        }

        livros.forEach(livro => {
            const card = `
                <div class="card-livro">
                    <div class="capa-container">
                        <img src="${livro.capa}" alt="Capa de ${livro.titulo}" 
                             onerror="this.src='https://via.placeholder.com/150x220?text=Sem+Capa'">
                    </div>
                    <div class="card-detalhes">
                        <h3>${livro.titulo}</h3>
                        <p class="autor"><strong>Autor:</strong> ${livro.autor}</p>
                        <div class="tags">
                            <span class="genero-tag">${livro.generol}</span>
                            <span class="qtd-tag">Qtd: ${livro.quantidade}</span>
                        </div>
                        <p class="descricao">${livro.descricao}</p>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    })
    .catch(error => {
        console.error("Erro ao listar livros:", error);
    });
}

window.onload = listarLivros;
