const express = require('express')
const handlebars = require ('express-handlebars')
const bodyParser = require ('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require(`./routes/usuario`)
const passport = require('passport')
require(`./config/auth`)(passport)
const eAdmin = require('../ProjetoNodeJS #1/helpers/eAdmin')
const serializeUser = require('./config/auth').serializeUser
require('./models/Usuario')
const Usuario = mongoose.model('usuarios')
const db = require('./config/db')

//Config
    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        //Configurando o Passport para realizar o salvamento dos dados na sessão, Seguir essa ordem
        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // HandleBars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main',}))
        app.set('view engine', 'handlebars')
    //mongoose
        mongoose.promise = global.promise
        mongoose.connect(db.mongoURI).then(() => {
            console.log('Conectado ao mongo')
        }).catch((erro) => {
            console.log(`Erro ao conectar ${erro}`)
        })
    //Public
        app.use(express.static(path.join(__dirname,'public')))

//MiddleWares

        app.use((req,res,next) => {
            res.locals.success_msg = req.flash('success_msg') //Mensagem Global de sucesso 
            res.locals.error_msg = req.flash('error_msg') //Mensagem Global de Erro
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            
            next()
        })

// Rotas 
        app.get('/',(req, res)=>{ //Rota principal 
            Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => { //Coletando todos os posts do servidor e enviado para o documento HTML
                if(req.session.passport){
                    Usuario.findById({_id: Object.values(req.session.passport)}).lean().then((dadosUser)=>{ //Coletando os dados do usuario logado e enviado para o HTML
                        res.locals.dadosUser = dadosUser //Variavel global para ser usada em mais de uma pagina no HTML
                        res.render('index', {postagens: postagens, dadosUser: dadosUser})
                    }).catch((erro) => {
                        console.log(`Erro ao buscar o usuario logado no banco de dados:`+ erro)
                    })
                }else{
                    res.render('index', {postagens: postagens})
                }     
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro')
                res.redirect('/404')
            })
        })
        app.get(`/404`, (req, res) =>{
            res.send("Erro 404!")
        })

        app.get('/postagens/:slug', (req, res) =>{ //Entrando por completo no assunto dos Posts
            Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => { //Realizando a busca no banco de dados
                if(postagem){
                    res.render('postagens/index', {postagem: postagem,})
                }else{
                    req.flash('error_msg', "Está Postagem não existe")
                    req.redirect("/")
                }
            }).catch((erro) =>{
                req.flash('error_msg', ' Houve um erro ')
                res.redirect('/')
            })
        })


        app.get ('/categorias', (req, res) =>{ //Rota que visualiza todas as categorias criadas
            Categoria.find().lean().then((categorias) => { //Realizando a busca das categorias no banco de dados
                res.render(`categorias/index`, {categorias: categorias})
            }).catch((erro) =>{
                req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
                res.redirect('/')
            })
        })

        app.get('/categorias/:slug', (req, res) => { //Visualizando apenas o filtro selecionado
            Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {//Buscando apenas a categoria selecionada
                if(categoria){
                    
                    Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{ //Realizando um filtro para buscar os Posts apenas daquela categoria

                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                    }).catch((erro) => {
                        req.flash('error_msg', 'Houve um erro ao listar os posts!')
                        res.redirect('/')
                    })

                }else{
                    req.flash('error_msg', 'Está categoria não existe')
                    res.redirect('/')
                }
            }).catch((erro) => {
                req.flash('error_msg', "Houve um erro ao carregar a pagina categoria")
                res.redirect("/")
            })
        })

        app.get ('/logout', (req,res)=>{ //Realizando o deslogamnto do usuario
            req.logout((erro) =>{
                req.flash('success_msg',"Deslogado com Sucesso")
                res.redirect("/")
            })
            })
            

        app.use('/admin',admin) // Importando a rota Admin e rota Usuarios
        app.use('/usuarios', usuarios)
//Outros
//Configurando o servidor e a porta
    const Port = process.env.PORT || 8081 //Para coletar a porta passada pelo hospedador vamos utilizar uma variavel de ambiente, que coleta automaticamente
    //Caso a variavel de ambiente não seja definida, vamos utilizar a 8081
    app.listen(Port, () => {
        console.log(`Servidor rodando na porta ${Port}`)
    })

