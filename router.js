const express = require('express');
const router = express.Router();
const createConnection = require('./database');
const connection = createConnection();
const crud = require('./controllers/crud');

router.use((req, res, next) => {
  res.locals.datos = req.session.datos; // Establece res.locals para que esté disponible en las vistas
  next();
});


router.get('/deleteClientSuministro/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM clientesSuministro WHERE noCliente = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/clientesSuministroAdmin');
    }
  });
});

router.get('/deleteUser/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM usuarios WHERE idUsuario = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/usersControlAdmin');
    }
  });
});

router.get('/deleteClientAdministracion/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM clientesAdministracion WHERE noCliente = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect('/clientesAdministracionAdmin');
    }
  });
});



router.post('/saveUser', crud.saveUser);

router.post('/inicioServicioMostrador', crud.inicioServicioMostrador);
router.post('/modificaMostrador', crud.modificaMostrador);
router.post('/cerrarMostrador', crud.cerrarMostrador);
router.post('/firmaMostrador', crud.firmaMostrador);

router.post('/inicioServicioLlegadas', crud.inicioServicioLlegadas);
router.post('/modificaLlegadas', crud.modificaLlegadas);
router.post('/cerrarLlegadas', crud.cerrarLlegadas);
router.post('/firmaLlegadas', crud.firmaLlegadas);


module.exports = router;
