const API_URL = "https://Muri26.pythonanywhere.com";

// 1. FUNÇÃO PARA CADASTRAR UM NOVO LIVRO
function cadastrarLivro() {
    // Pega os valores digitados nos campos do seu HTML
    const livro = {
        id: Date.now(), // Cria um ID único usando a hora atual
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        capa: document.getElementById('capa').value,
        descricao: document.getElementById('descricao').value,
        generol: document.getElementById('generol').value,
        quantidade: document.getElementById('quantidade').value
    };

    // Validação simples: não deixa enviar sem título ou autor
    if (!livro.titulo || !livro.autor) {
        alert("Por favor, preencha pelo menos o título e o autor.");
        return;
    }

    // Envia os dados para o PythonAnywhere via POST
    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(livro)
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao salvar no servidor');
        return response.json();
    })
    .then(data => {
        alert("📚 Livro salvo com sucesso no Excel!");
        console.log("Resposta do servidor:", data);
        
        // Limpa os campos do formulário para o próximo cadastro
        document.getElementById('form-livro').reset();
        
        // Atualiza a lista de livros na tela automaticamente
        listarLivros();
    })
    .catch(error => {
        console.error("Erro no cadastro:", error);
        alert("Erro ao conectar com o servidor. Verifique se deu 'Reload' no PythonAnywhere.");
    });
}

// 2. FUNÇÃO PARA BUSCAR E EXIBIR OS LIVROS DO EXCEL
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(response => response.json())
    .then(livros => {
        const container = document.getElementById('lista-livros');
        if (!container) return;

        container.innerHTML = ""; // Limpa a lista atual para não duplicar

        if (livros.length === 0) {
            container.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
            return;
        }

        // Cria o visual de cada livro que vem do Excel
        livros.forEach(livro => {
            const card = `
                <div class="livro-card" style="border: 1px solid #ccc; padding: 10px; margin: 10px; border-radius: 8px;">
                    <img src="${livro.capa}" alt="Capa" style="width:100px; display:block; margin-bottom:10px;">
                    <strong style="font-size: 1.2em;">${livro.titulo}</strong>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Gênero:</strong> ${livro.generol}</p>
                    <p><strong>Quantidade:</strong> ${livro.quantidade}</p>
                    <p><em>${livro.descricao}</em></p>
                </div>
            `;
            container.innerHTML += card;
        });
    })
    .catch(error => {
        console.error("Erro ao listar livros:", error);
    });
}

// Executa a listagem assim que a página termina de carregar
window.onload = listarLivros;
