const localStrategy = require('passport-local').Strategy // Impotando midle para de estrategia de autenticação, instalando o recurso(npm install --save passport) e instalando o metodo utilizado (npm install --save passport-local)
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
var iduser = 'Rikke'
//model
require('../models/Usuario') //importando o models Usuario para buscar informações dentro do banco de dados
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){ //Exportando o a função passport para realizar a autenticação
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => { //passsando os parametros para fazer o login, no caso email e senha

        Usuario.findOne({email: email}).then((usuario) => { //Fazendo a busca no banco de dados do email se existe
            if(!usuario){
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {//Coletando a senha e descriptografando para verificar se o HASH é o mesmo
                if(batem){
                    return done(null,usuario)
                }else{
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        })
    }))

    //Codigo abaxo, serve para salvar dados do usuario em uma sessão, assim que o usuario logar no site, será salvo essa informação
    passport.serializeUser((usuario, done) => {
        done(null, usuario._id)
    })

    passport.deserializeUser((id, done) => {
        try{
            const user = Usuario.findById(id)
            done (null, user)
        }
        catch(err){
            console.log(err)
            return done(err, null)
        }
    })
}

module.exports.iduser = iduser
