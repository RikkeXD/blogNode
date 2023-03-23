const eAdmin = async (req, res, next) => {
    if (req.isAuthenticated()) { //Realizando a autenticação e verificando se o usuario tem permissão ADMIN
      const usuario = await req.user.exec(); 
      if (usuario.eAdmin == 1){ //Atraves do campo de ususario se for 1 tem direito se for 0 não é Admin
        return next();
      }
    }
    req.flash("error_msg", "Precisa ser um Administrador");
    res.redirect("/");
  };
  
  module.exports = eAdmin