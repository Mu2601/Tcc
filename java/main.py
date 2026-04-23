from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app) # Isso permite que o seu site no GitHub converse com o Python

FILE_NAME = 'livros.xlsx'

# Função para garantir que o Excel existe com as colunas certas
def inicializar_excel():
    if not os.path.exists(FILE_NAME):
        df = pd.DataFrame(columns=['id', 'titulo', 'autor', 'capa', 'descricao', 'generol', 'quantidade'])
        df.to_excel(FILE_NAME, index=False)

@app.route('/livros', methods=['GET'])
def listar_livros():
    df = pd.read_excel(FILE_NAME)
    # Transforma o Excel em JSON para o site entender
    return df.to_json(orient='records')

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    novo_livro = request.get_json()
    df = pd.read_excel(FILE_NAME)
    
    # Adiciona o novo livro na tabela
    df = pd.concat([df, pd.DataFrame([novo_livro])], ignore_index=True)
    df.to_excel(FILE_NAME, index=False)
    
    return jsonify({"mensagem": "Livro salvo no Excel com sucesso!"}), 200

if __name__ == '__main__':
    inicializar_excel()
    app.run(host='0.0.0.0', port=5000)
