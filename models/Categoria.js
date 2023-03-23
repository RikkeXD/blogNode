const mongoose = require('mongoose')//Criando o model para armazenar os dados das categorias no Banco de Dados
const Schema = mongoose.Schema 

const Categoria = new Schema ({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    }, 
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('categorias', Categoria)