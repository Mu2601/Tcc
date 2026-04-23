const urlGoogle = 'SUA_URL_DO_APPS_SCRIPT';

async function cadastrarLivro() {
    const t = document.getElementById('titulo').value;
    const a = document.getElementById('autor').value;
    const c = document.getElementById('capa').value;
    const d = document.getElementById('descricao').value;

    if (!t || !a) return alert("Título e Autor são obrigatórios!");

    const novoLivro = {
        titulo: t,
        autor: a,
        capa: c,
        descricao: d,
        status: 'disponível'
    };

    try {
        // No POST (cadastro), NÃO use o corsproxy.io
        await fetch(urlGoogle, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(novoLivro)
        });
        alert("Livro salvo!");
        location.reload();
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}
