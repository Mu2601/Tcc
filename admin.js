

async function cadastrarLivro() {
    // 1. Pegando os valores
    const t = document.getElementById('titulo').value;
    const a = document.getElementById('autor').value;
    const c = document.getElementById('capa').value;
    const g = document.getElementById('generol').value;
    const d = document.getElementById('descricao').value;
    const h = document.getElementById('quantidade').value; // 'h' é a quantidade

    // 2. Validação: Adicionei o 'g' (gênero) aqui para obrigar o preenchimento
    if (!t || !a || !g) {
        alert("Preencha o título, autor e gênero!");
        return;
    }

    // 3. Montando o objeto CORRIGIDO (Adicionado generol e quantidade)
    const novoLivro = {
        id: Date.now().toString(),
        titulo: t,
        autor: a,
        capa: c,
        generol: g,       // <--- Faltava isso
        descricao: d,
        quantidade: h,    // <--- Faltava isso (certifique-se que o nome aqui seja igual ao do doPost)
        status: 'disponível',
        prazo: ''
    };

    try {
        await fetch(planilhalivros, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(novoLivro)
        });

        alert("Livro salvo com sucesso!");
        location.reload();
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao conectar com a planilha.");
    }
}