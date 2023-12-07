//MODULOS NECESARIOS
const express = require('express');
const flash = require('express-flash');
const app = express();
const session = require('express-session');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
const createConnection = require('./database')
const bodyParser = require('body-parser');
const {createCanvas, loadImage}= require('canvas');
const fs = require('fs');
const port = process.env.PORT || 3000;


//DEFINIR RUTAS DE ARCHIVOS ESTATICOS
app.use('/css', express.static(__dirname + '/css'));
app.use('/vendor', express.static(__dirname + '/vendor'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));




const fechaActual = new Date(); //Fecha actual
const horaActual = fechaActual.getHours();
const minActual = fechaActual.getMinutes();
const segActual = fechaActual.getSeconds()
const horaCompleta = horaActual + ':' + minActual + ':' + segActual;
const diaActual = fechaActual.getDate();
const mesActual = fechaActual.getMonth()+1;
const anioActual = fechaActual.getFullYear();
const fechaCompleta = anioActual + '-' + mesActual + '-' + diaActual;


// Configuración de express-session
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

const connection = createConnection();

app.use(bodyParser.urlencoded({extended:true}));




// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Ruta de inicio de sesión
app.get('/', (req, res) => {//DECLARAMOS QUE EL INDEX ES EL INICIO
  res.render('login');
});

const verificarSesion = (req, res, next) => {
  if (req.session && req.session.datos) {
    // El usuario tiene una sesión activa, permitir el acceso a las rutas del panel de control
    next();
  } else {
    // El usuario no tiene una sesión activa, redireccionar al inicio de sesión
    res.redirect('/');
  }
};

// Ruta de validación de inicio de sesión
app.post('/login', (req, res) => { //DESDE HTML EJECUTAMOS EL POST CON NOMBRE /login PARA QUE PODAMOS LLAMARLO
  const { username, password } = req.body; //TRAEMOS LOS DATOS DEL INDEX.HTML QUE SON LOS DATOS DE INICIO DE SESION

  const query = 'SELECT * FROM colaboradores WHERE noColaborador = ? AND password = ? AND statusColaborador = ?'; //QUERY PARA OBTENER SI EXISTE UN USUARIO CON ESE USERNAME Y PASSWORD Y QUE ADEMAS ESTE ACTIVO
  connection.query(query, [username, password,'ACTIVO'], (error, results) => { //PASAMOS LOS PARAMETROS AL QUERY Y OBTENEMOS EL RESULTADO O EL ERROR
    if (error) {
      console.error('Error en la consulta:', error); //NOS MUESTRA EN LA CONSOLA SI ES QUE XISTE ALGUN ERROR EN EL QUERY
      res.redirect('/'); //SI EXISTE UN ERROR NOS REDIRECCIONA A LA PAGINA PRINCIPAL QUE ES EL LOGIN
    } else if (results.length === 1) {//VALIDAMOS SI ENCONTRO UN DATO EN EL QUERY
      const nivelUsuario = results[0].nivelUsuario;
      req.session.datos = { //GUUARDAMOS EN EL OBJETO DATOS TODO LO QUE TRAIGAMOS DEL USUARIO EN EL QUERY
        noColaborador: results[0].noColaborador,
        nombreColaborador: results[0].nombreColaborador,
        apellidoColaborador: results[0].apellidoColaborador,
        nivelUsuario: results[0].nivelUsuario,
        username: results[0].username,
        password: results[0].password,
        tia: results[0].tia,
        siglas: results[0].siglas,
        estacion: results[0].estacion,
        statusColaborador: results[0].statusColaborador
      }     
      console.log(req.session.datos);
      
      //VALIDAMOS LOS ROLES PPARA REDIRECCIONAR A LA PAGINA RESPECTIVA
      if (nivelUsuario === 'ADMINISTRADOR') {
        res.redirect('/administrador');
      }else if (nivelUsuario === 'SUPERVISOR') {
        res.redirect('/supervisor');
      
      } else if(nivelUsuario === 'OPERADOR'){
        res.redirect('/operador')
      }else if(nivelUsuario === 'AGENTE'){
        res.redirect('/agenteAerolinea')
      } else {
        req.flash('error','Tu nivel de Usuario no es valido, intenta nuevamente')
        res.redirect('/');
        
      }
    } else {
      req.flash('error','Credenciales invalidas. Intentalo Nuevamente');
      res.redirect('/');//SI NO ENCUENTRA NINGUN DATO NOS REDIRECCIONA A LA PAGINA PRINCIPAL NUEVAMENTE
      
    }
  });
});

// Ruta de cierre de sesión
app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    console.log('Sesion cerrada')
    res.redirect('/');
  });
});


// DECLARAMOS LA Ruta del dashboard del administrador
app.get('/administrador',verificarSesion, (req, res) => {
  connection.query('SELECT COUNT(*) AS total FROM serviciosllegadas',(error, results)=>{
    if(error){
        throw error;
    } else {
      connection.query('SELECT COUNT(*) AS total FROM serviciosmostrador',(error, results2)=>{
        if(error){
            throw error;
        } else {
          const datos = req.session.datos; //OBTENEMOS LA VARIABLE DATOS QUE CREAMOS EN EL METODO DE ARRIBA POST 
          res.render('administrador',{results:results,results2:results2,datos}); //PASAMOS EL OBJETO CON LOS DATOS QUE RECUPERAMOS ANTERIORMENTE
        }   
      })
    }   
  })
  
});

app.get('/agenteAerolinea',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM serviciosmostrador WHERE statusServicio = ? ORDER BY fechaServicio, horaFin ASC',['TERMINADO'],(error, results)=>{
      if(error){
          throw error;
      } else {
        connection.query('SELECT * FROM serviciosLlegadas WHERE statusServicio = ? ORDER BY fechaServicio, horaFin ASC',['TERMINADO'],(error, results2)=>{
          if(error){
              throw error;
          } else {
              const datos = req.session.datos;                     
              res.render('agenteAerolinea', {results:results,results2:results2,datos});  
                        
          }   
      }) 
                    
      }   
  })
});

//CONTROL DE USUARIOS
app.get('/controlColaboradores',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM colaboradores',(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('controlColaboradores', {results:results,datos});  
                    
      }   
  })
});

app.get('/agregarColaborador', (req,res)=>{
  connection.query('SELECT  abreviacion FROM sedes WHERE status = ?',['Activo'],(error,results)=>{
    if(error){
        throw error;
    } else {
        const opcionesSede = results.map(row => row.abreviacion );
        const datos = req.session.datos;
        res.render('agregarColaborador',{opcionesSede,datos});
        console.log(opcionesSede);
    }
})          
});

//SERVICIOS MOSTRADOR
app.get('/inicioMostrador', (req,res)=>{
  const estacion = req.session.datos.estacion;
  connection.query('SELECT nombreAerolinea from aerolineas_sede WHERE sedeAerolinea = ? AND STATUS = ?',[estacion,'ACTIVO'],(error,results)=>{
    if (error){
      throw error;
    } else {
      const opcionesAerolinea = results.map(row => row.nombreAerolinea)
      const datos = req.session.datos;
      res.render('inicioMostrador',{datos,opcionesAerolinea});
    }
  })
});

app.get('/gestionMostrador',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM serviciosmostrador WHERE statusServicio = ? ORDER BY horaInicio ASC',['INICIADO'],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('gestionMostrador', {results:results,datos});  
                    
      }   
  })
});

app.get('/verMostrador/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosmostrador WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('verMostrador', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/cerrarMostrador/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosmostrador WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('cerrarMostrador', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/firmaMostradorAgente/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosmostrador WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('firmaMostradorAgente', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/inicioLlegadas', (req,res)=>{
  const estacion = req.session.datos.estacion;
  connection.query('SELECT nombreAerolinea from aerolineas_sede WHERE sedeAerolinea = ? AND STATUS = ?',[estacion,'ACTIVO'],(error,results)=>{
    if (error){
      throw error;
    } else {
      const opcionesAerolinea = results.map(row => row.nombreAerolinea)
      const datos = req.session.datos;
      res.render('inicioLlegadas',{datos,opcionesAerolinea});
    }
  })
});

app.get('/gestionLlegadas',verificarSesion, (req, res)=>{     
  connection.query('SELECT * FROM serviciosLlegadas WHERE statusServicio = ? ORDER BY horaInicio ASC',['INICIADO'],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('gestionLlegadas', {results:results,datos});  
                    
      }   
  })
});

app.get('/verLlegadas/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosLlegadas WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('verLlegadas', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/cerrarLlegadas/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosLlegadas WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('cerrarLlegadas', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/firmaLlegadasAgente/:noServicio/:estacion',verificarSesion, (req, res)=>{   
  const noServicio = req.params.noServicio;
  const estacion = req.params.estacion;

  connection.query('SELECT * FROM serviciosLlegadas WHERE noServicio = ? AND estacion = ?',[noServicio,estacion],(error, results)=>{
      if(error){
          throw error;
      } else {
          const datos = req.session.datos;                     
          res.render('firmaLlegadasAgente', {service:results[0],datos});  
                    
      }   
  })
});

app.get('/inicioVuelosLlegadas', (req,res)=>{
  const estacion = req.session.datos.estacion;
  connection.query('SELECT nombreAerolinea from aerolineas_sede WHERE sedeAerolinea = ? AND STATUS = ?',[estacion,'ACTIVO'],(error,results)=>{
    if (error){
      throw error;
    } else {
      const opcionesAerolinea = results.map(row => row.nombreAerolinea)
      const datos = req.session.datos;
      res.render('inicioVuelosLlegadas',{datos,opcionesAerolinea});
    }
  })
});


app.use('/', require('./router'));



// Iniciar el servidor

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
