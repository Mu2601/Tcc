async function cadastrarLivro() {
    // Captura os dados dos campos do formulário
    const t = document.getElementById('titulo').value;
    const a = document.getElementById('autor').value;      // Coluna C
    const c = document.getElementById('capa').value;       // Coluna D
    const d = document.getElementById('descricao').value;  // Coluna E
    const g = document.getElementById('generol').value;
    const h = document.getElementById('quantidade').value;

    if (!t || !a || !g) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    const novoLivro = {
        id: Date.now().toString(),
        titulo: t,
        autor: a,
        capa: c,
        descricao: d,
        generol: g,
        quantidade: h,
        status: 'disponível'
    };

    try {
        // Envia para a URL do Google Apps Script (sem o proxy corsproxy)
        await fetch('SUA_URL_DO_GOOGLE_SCRIPT', {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(novoLivro)
        });
        alert("Livro cadastrado com sucesso!");
        location.reload();
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}
