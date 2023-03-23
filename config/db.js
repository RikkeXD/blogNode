if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://rikkeadmin:D7rZjPy59SenPTm2@blogapp.54e48oz.mongodb.net/?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://127.0.0.1/blogapp'}
}