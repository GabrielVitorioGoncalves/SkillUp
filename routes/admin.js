var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin');
});

router.get('/dashboard', async function(req,res,next){
  verificarLogin(res);
  res.render('dashboard');
});




router.post('/loginadmin', async function(req,res,next){
  const email = req.body.email;
  const senha = req.body.senha;

  const admin = await global.banco.buscarAdmin({email, senha});

  if(admin.id_admin){
    global.id_admin = admin.id_admin;
    global.adm_email = admin.adm_email;

    res.redirect('/admin/dashboard');
  }else{
    res.redirect('/admin');
  }
});


function verificarLogin(res) {
  console.log("entrou em verificarLogin");
  if (!global.adm_email || global.adm_email == "") {
    res.redirect('/admin');
  }

}


module.exports = router;
