const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const eAdmin = require('../helpers/eAdmin')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

router.get('/', eAdmin, (req, res) =>{ //Renderizando a pagina de menu dos administradores
    res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res) => {//Rota para visualizar e direcionar para a criação de categorias
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {//Realizando o filtro no banco de dados com filtro dos mais novos para os antigos
        res.render('admin/categorias', {categorias: categorias})
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao Listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req,res)=>{ //Direcionado para a pagina de criação de categorias
    res.render('admin/addcategorias')
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => { //Rota para editar categorias
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) =>{ //Realizando a buscar dos dados da categoria selecionada e passado o ID da categoria atraves do "PARAMS"
        res.render('admin/editcategorias', {categoria: categoria}) //Enviado as informações coletadas para o HTML
    }).catch((erro) => {
        req.flash('error_msg', 'Está categoria não existe!')
        res.redirect("/admin/categorias")
    })
    
})

router.post('/categorias/edit', eAdmin, (req, res) => { //Recebendo as Informações das alterações da categoria

    var errosedit = [] //Array para armazenar os erro que o usuario cometer
    //Realizando condições para o usuario não armazenar dados incorretos ou diferente do que é solicitado
    if(!req.body.nome){
        errosedit.push({texto: "Nome invalido ou vazio!"}) //Adicionando o erro na Array
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errosedit.push({texto: "Slug invalido ou vazio"})
    }
    if(req.body.nome.length < 2){
        errosedit.push({texto: "Nome muito curto!"})
    }
    if(errosedit.length > 0){//Verificando se a array tem algum erro
        Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {//Realizando a busca novamente da categoria e eniando para o HTML novamente, pois ocorreu algum erro
            res.render("admin/editcategorias", { categoria: categoria, errosedit: errosedit})//Passando tanto as informações do erro quanto da categoria para o HTML
        }).catch((err) => {
            req.flash("error_edit", "Erro ao coletar os dados")
            res.redirect("admin/categorias")
        })

    }else{
           Categoria.findOne({_id:req.body.id}).then((categoria)=> { //Realizando a alteração no banco de dados, caso não houver nenhum erro
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug
    
                categoria.save().then(() =>{//Passando o parametro para salvar os dados coletados nos inputs do HTML
                    req.flash('success_msg', "Categoria editada com sucesso!")
                    res.redirect('/admin/categorias')
                }).catch((erro)=> {
                    req.flash('error_msg', `Houve um erro ao editar ${erro}`)
                    res.redirect(`/admin/categorias`)
                })
            }).catch((erro) => {
                req.flash('error_msg', `Houve um erro ao editar a categoria ${erro}`)
                res.redirect('/admin/categorias')
            })
    }
})    

router.post('/categorias/deletar', eAdmin, (req, res) => {//Recebendo as informações para realizar a Exclusão da categoria
    Categoria.findOneAndRemove({_id: req.body.id}).then(() => {//Recebendo o ID da categoria atraves de um Input Hidden(oculto)
        req.flash ('success_msg', `Categoria deletada com sucesso`)
        res.redirect('/admin/categorias')
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categoria/nova', eAdmin, (req, res) => {

    var erros = [] //Array para armazenar os erro que o usuario cometer

    //Realizando condições para o usuario não armazenar dados incorretos ou diferente do que é solicitado
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome Inválido'})
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno!"})
    }
    if (erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})

    }else{
       
            const novaCategoria = { //Realizando a alteração no banco de dados, caso não houver nenhum erro
                nome: req.body.nome, //Recebendo dados do input
                slug: req.body.slug
            }
        
            new Categoria(novaCategoria).save().then(()=>{ //Passando o parametro para salvar os dados coletados nos inputs do HTML
                    req.flash('success_msg', 'Categoria criada com sucesso!')
                    res.redirect('/admin/categorias')
                }).catch((erro)=>{
                    req.flash('error_msg', 'Houve um erro, Tente novamente!')
                    res.redirect('/admin')
                })
            }
})

router.get('/postagens', eAdmin, (req, res) =>{//Acessando a rota de Postagens e mostrando todos os Posts criado
    Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens) =>{ //Recebendo os post do banco de dados e 
        res.render('admin/postagens', {postagens: postagens})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
    
})

router.get('/postagens/add', eAdmin, (req, res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((erro) =>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
    
})

router.post('/postagens/nova', eAdmin, (req,res) =>{
    
    var erros = []

    if (!req.body.titulo ||typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Nome inválido"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválidos ou vazio!"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválido ou vazio!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteudo invalido ou vazio!!"})
    }
    if(req.body.titulo. length < 2){
        erros.push({texto: "Titulo muito curto!"})
    } 
    if (req.body.slug.length < 2){
        erros.push({texto:'Slug muito curto!'})
    }
    if (req.body.descricao.length <5){
        erros.push({texto: "Descrição muito curto!"})
    }
    if(req.body.conteudo.length <10){
        erros.push({texto: "Conteúdo muito curto!"})
    }

    if(req.body.categoria == '0'){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0) {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/addpostagem', {erros: erros, categorias: categorias})
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulario")
            res.redirect('/admin/postagens')
        })
        
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao salvar a postagem')
            res.redirect('/admin/postagens')
        })

    }

})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((error) => {
            req.flash('erroe_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((erro) =>{
        req.flash('error_msg', "Houve um erro ao carregar o formulário de edição")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagem/edit', eAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', "Postagem editada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((erro)=> {
            req.flash('error_msg', "Erro Interno")
            res.redirect('/admin/postagens')
        })

    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao salvar a edição')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar', eAdmin, (req,res)=>{
    Postagem.findOneAndRemove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada com Sucesso')
        res.redirect('/admin/postagens')
    }).catch((erro)=>{
        req.flash('error_msg', "Erro ao deletar a postagem")
        res.redirect('/admin/postagens')
    })
})

router.get("/usuarios", eAdmin, (req,res) => {
    Usuario.find().lean().then((usuarios) =>{
        res.render('admin/usuarios',{usuarios: usuarios})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar os usuarios ')
        res.redirect('/admin')
    })
    
})

router.get("/editusuario/:id", eAdmin, (req,res) => {
    Usuario.findOne({_id: req.params.id}).lean().then((usuario)=> {
        res.render('admin/editusuarios',{usuario: usuario})
    })
    
})

router.post("/editusuario", eAdmin ,(req, res) => {

    errouser = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errouser.push("Nome invalido ou vazio !")
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errouser.push('Email vazio ou invalido')
    }

    if(req.body.nome.length < 3){
        errouser.push('Nome muito curto!')
    }
    if(req.body.nome.length < 6){
        errouser.push('Email muito curto!')
    }
    if(errouser.length > 0 ){
        Usuario.findOne({_id: req.body.id}).lean().then((usuario)=> {
            res.render('admin/editusuarios', {usuario: usuario, errouser:errouser })
        }).catch((err)=>{
            req.flash('error_msg','Ocorreu um erro ao editar o usuario')
            res.redirect('/admin/usuarios')
        })
    }else{

        Usuario.findOne({_id: req.body.id}).then((usuario) => {
            usuario.nome = req.body.nome
            usuario.email = req.body.email
            usuario.eAdmin = req.body.eAdmin
    
            usuario.save().then(()=>{
                req.flash('success_msg', 'Usuario editado com sucesso!')
                res.redirect("/admin/usuarios")
            }).catch((err)=>{
                req.flash('error_msg','Erro ao editar o usuario')
                res.redirect('/admin/usuarios')
            })
        }).catch((err) => {
            req.flash('erro_msg',"Erro ao carregar o usuario")
            res.redirect("/admin/usuarios")
        })
    }
    
    
})

router.post("/deleteuser", eAdmin, (req,res)=>{
    if(Object.values(req.session.passport) == req.body.id){
        req.flash('error_msg', 'Erro ao excluir, usuario atual logado!')
        res.redirect('/admin/usuarios')
    }else{
        Usuario.findOneAndRemove({_id: req.body.id}).lean().then(()=>{
            req.flash('success_msg', 'Usuario deletado com sucesso!')
            res.redirect('/admin/usuarios')
        }).catch((erro) => {
            req.flash('error_msg', "Erro ao deletar usuario")
            res.redirect("/admin/usuarios")
        })
    }
})
    
module.exports = router