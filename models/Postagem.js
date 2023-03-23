const mongoose = require('mongoose') //Criando a estrutura para armazenar a postagem 
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo:{
        type: String,
        require: true
    },
    slug:{
        type: String,
        require: true,
    }, 
    descricao:{
        type: String,
        require: true
        
    },
    conteudo:{
        type: String,
        requeire: true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias",
        require: true
    },
    data:{
        type: Date,
        default: Date.now
    }
})

mongoose.model('postagens', Postagem)