//Invocamos a la conexion de la DB
const express = require('express');
const session = require('express-session');

const bodyParser = require('body-parser');
const {createCanvas, loadImage}= require('canvas');
const fs = require('fs');
const createConnection = require('../database');
const connection = createConnection();


const fechaActual = new Date(); //Fecha actual
const horaActual = fechaActual.getHours();
const minActual = fechaActual.getMinutes();
const segActual = fechaActual.getSeconds()
const horaCompleta = horaActual + ':' + minActual + ':' + segActual;
const diaActual = fechaActual.getDate();
const mesActual = fechaActual.getMonth()+1;
const anioActual = fechaActual.getFullYear();
const fechaCompleta = anioActual + '-' + mesActual + '-' + diaActual;

//GUARDAR un REGISTRO
exports.saveUser = (req, res)=>{
    const num = req.body.num;
    const nombre = req.body.nombre.toUpperCase();
    const apellido = req.body.apellido.toUpperCase();
    const rol = req.body.rol.toUpperCase();
    const estacion = req.body.estacion.toUpperCase();
    const st = 'ACTIVO';
    const TIA = req.body.TIA;
    const pass = req.body.pass;
    const siglas = req.body.siglas.toUpperCase();
    
    connection.query('SELECT COUNT(*) AS count FROM colaboradores WHERE noColaborador = ?',[num], (error, countResult)=>{
        if(error){
            console.log(error);
        }else{
            const existingCount = countResult[0].count;
            if (existingCount === 0)
            {
                connection.query('INSERT INTO colaboradores SET ?',{noColaborador:num,nombreColaborador:nombre,apellidoColaborador:apellido,nivelUsuario:rol,estacion:estacion,
                                                                    tia:TIA,password:pass,siglas:siglas,statusColaborador:st}, (error, results)=>{
                    if(error){
                        console.log(error);
                    }else{
                        
                        res.redirect('/controlColaboradores');
                               
                    }
            });   
            }
            else{
                
                res.redirect('/agregarColaborador');
            
            }
               
        }
});
};


exports.inicioServicioMostrador = (req, res)=>{
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const puerta = req.body.puerta;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    const statusServicio = 'INICIADO';
    const origen = req.body.origenVuelo;
    const destino = req.body.destinoVuelo;

    connection.query('SELECT siglas FROM colaboradores WHERE noColaborador = ? AND estacion = ?',[noColaborador,estacion], (error, results3)=>{
        if(error){
            console.log(error);
        }else{
            connection.query('SELECT MIN(qr) AS qr FROM qrs WHERE status = ? AND estacion = ?',['DISPONIBLE',estacion], (error, results)=>{
                if(error){
                    console.log(error);
                }else if(results.length === 1){
                    const qrAsignado = results[0].qr;
                    const siglas = results3[0].siglas;
                    connection.query('INSERT INTO serviciosmostrador SET ?',{nombrePax:nombrePax,aerolinea:aerolinea,vuelo:vuelo,noSilla:noSilla,puerta:puerta,ETA:ETA,ASIENTO:asiento,
                                                                             noColaborador:siglas,fechaServicio:fechaServicio,tipoVuelo:tipoVuelo,origenReserva:origenReserva,
                                                                             qrAsignado:qrAsignado,usuarioInicio:usuarioInicio,observaciones:observaciones,
                                                                             estacion:estacion,horaInicio:horaInicio,tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado,statusServicio:statusServicio,
                                                                            origen:origen,destino:destino}, (error, results2)=>{
                        if(error){
                            console.log(error);
                        }else{
                            const insertId = results2.insertId;
                            connection.query('UPDATE qrs SET status = ?, folioAsignado = ? WHERE qr = ? AND estacion = ?',['OCUPADO',insertId,qrAsignado,estacion], (error, results3)=>{
                                if(error){
                                    console.log(error);
                                }else{
                                    res.redirect('/gestionMostrador');
                                }
                            });   
                        }
                    });   
                }
            });
        }
    });
};

exports.modificaMostrador = (req, res)=>{
    const noServicio = req.body.noServicio;
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const puerta = req.body.puerta;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    const statusServicio = 'INICIADO';


    connection.query('UPDATE serviciosmostrador SET ? WHERE noServicio = ? AND estacion = ?',[{nombrePax:nombrePax,vuelo:vuelo,puerta:puerta,ETA:ETA,ASIENTO:asiento,
                                                            tipoVuelo:tipoVuelo,origenReserva:origenReserva,
                                                            usuarioModifico:usuarioModifico,observaciones:observaciones,
                                                            tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/gestionMostrador')
        }
    });
};

exports.cerrarMostrador = (req, res)=>{
    const noServicio = req.body.noServicio;
    const qrAsignado = req.body.qr;
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const puerta = req.body.puerta;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    let statusServicio = '';
    
    if(nombreAgente === ''){
        statusServicio = 'TERMINADO';
    }else{
        statusServicio = 'COMPLETADO';
    }

    connection.query('UPDATE serviciosmostrador SET ? WHERE noServicio = ? AND estacion = ?',[{nombrePax:nombrePax,vuelo:vuelo,puerta:puerta,ETA:ETA,ASIENTO:asiento,
                                                            tipoVuelo:tipoVuelo,origenReserva:origenReserva,nombreAgente:nombreAgente,firmaAgente:firmaBase64,
                                                            usuarioModifico:usuarioModifico,observaciones:observaciones,statusServicio:statusServicio,horaFin:horaFin,
                                                            tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            connection.query('UPDATE qrs SET status = ?, folioAsignado = ? WHERE qr = ? AND estacion = ?',['DISPONIBLE','',qrAsignado,estacion], (error, results3)=>{
                if(error){
                    console.log(error);
                }else{
                    res.redirect('/gestionMostrador');
                }
            });
        }
    });
};

exports.firmaMostrador = (req, res)=>{
    const noServicio = req.body.noServicio;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const estacion = req.body.estacion;
    const statusServicio = 'COMPLETADO';

    connection.query('UPDATE serviciosmostrador SET ? WHERE noServicio = ? AND estacion = ?',[{nombreAgente:nombreAgente,firmaAgente:firmaBase64,statusServicio:statusServicio}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/agenteAerolinea')
        }
    });
};

exports.inicioServicioLlegadas = (req, res)=>{
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const pos = req.body.pos;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    const statusServicio = 'INICIADO';

    connection.query('SELECT siglas FROM colaboradores WHERE noColaborador = ? AND estacion = ?',[noColaborador,estacion], (error, results3)=>{
        if(error){
            console.log(error);
        }else{
            connection.query('SELECT MIN(qr) AS qr FROM qrs WHERE status = ? AND estacion = ?',['DISPONIBLE',estacion], (error, results)=>{
                if(error){
                    console.log(error);
                }else if(results.length === 1){
                    const qrAsignado = results[0].qr;
                    const siglas = results3[0].siglas;
                    connection.query('INSERT INTO serviciosllegadas SET ?',{nombrePax:nombrePax,aerolinea:aerolinea,vuelo:vuelo,noSilla:noSilla,pos:pos,ETA:ETA,ASIENTO:asiento,
                                                                             noColaborador:siglas,fechaServicio:fechaServicio,tipoVuelo:tipoVuelo,origenReserva:origenReserva,
                                                                             qrAsignado:qrAsignado,usuarioInicio:usuarioInicio,observaciones:observaciones,
                                                                             estacion:estacion,horaInicio:horaInicio,tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado,statusServicio:statusServicio}, (error, results2)=>{
                        if(error){
                            console.log(error);
                        }else{
                            const insertId = results2.insertId;
                            connection.query('UPDATE qrs SET status = ?, folioAsignado = ? WHERE qr = ? AND estacion = ?',['OCUPADO',insertId,qrAsignado,estacion], (error, results3)=>{
                                if(error){
                                    console.log(error);
                                }else{
                                    res.redirect('/gestionLlegadas');
                                }
                            });   
                        }
                    });   
                }
            });
        }
    });
};

exports.modificaLlegadas = (req, res)=>{
    const noServicio = req.body.noServicio;
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const pos = req.body.pos;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    const statusServicio = 'INICIADO';

    connection.query('UPDATE serviciosLlegadas SET ? WHERE noServicio = ? AND estacion = ?',[{nombrePax:nombrePax,vuelo:vuelo,pos:pos,ETA:ETA,ASIENTO:asiento,
                                                            tipoVuelo:tipoVuelo,origenReserva:origenReserva,
                                                            usuarioModifico:usuarioModifico,observaciones:observaciones,
                                                            tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/gestionLlegadas')
        }
    });
};

exports.cerrarLlegadas = (req, res)=>{
    const noServicio = req.body.noServicio;
    const qrAsignado = req.body.qr;
    const nombrePax = req.body.nombrePax.toUpperCase();
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const noSilla = req.body.noSilla;
    const POS = req.body.pos;
    const ETA = req.body.eta;
    const asiento = req.body.noAsiento;
    const noColaborador = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const tipoVuelo = req.body.tipoVuelo;
    const origenReserva = req.body.origen;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const horaInicio = req.body.timeInputStart;
    const horaFin = req.body.timeInputClose;
    const tipoSilla = req.body.tipoSilla;
    const servicioSolicitado = req.body.ServicioSolicitado;
    let statusServicio = '';
    
    if(nombreAgente === ''){
        statusServicio = 'TERMINADO';
    }else{
        statusServicio = 'COMPLETADO';
    }

    connection.query('UPDATE serviciosLlegadas SET ? WHERE noServicio = ? AND estacion = ?',[{nombrePax:nombrePax,vuelo:vuelo,pos:POS,ETA:ETA,ASIENTO:asiento,
                                                            tipoVuelo:tipoVuelo,origenReserva:origenReserva,nombreAgente:nombreAgente,firmaAgente:firmaBase64,
                                                            usuarioModifico:usuarioModifico,observaciones:observaciones,statusServicio:statusServicio,horaFin:horaFin,
                                                            tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            connection.query('UPDATE qrs SET status = ?, folioAsignado = ? WHERE qr = ? AND estacion = ?',['DISPONIBLE','',qrAsignado,estacion], (error, results3)=>{
                if(error){
                    console.log(error);
                }else{
                    res.redirect('/gestionLlegadas');
                }
            });
        }
    });
};

exports.firmaLlegadas = (req, res)=>{
    const noServicio = req.body.noServicio;
    const nombreAgente = req.body.nombreAgente;
    const firmaBase64 = req.body.firma;
    const estacion = req.body.estacion;
    const statusServicio = 'COMPLETADO';

    connection.query('UPDATE serviciosLlegadas SET ? WHERE noServicio = ? AND estacion = ?',[{nombreAgente:nombreAgente,firmaAgente:firmaBase64,statusServicio:statusServicio}, noServicio,estacion], (error, results2)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/agenteAerolinea')
        }
    });
};

exports.inicioControlLlegadas = (req, res)=>{
    const aerolinea = req.body.aerolinea.toUpperCase();
    const vuelo = req.body.noVuelo;
    const pos = req.body.pos;
    const ETA = req.body.eta;
    const operadores = req.body.operador;
    const fechaServicio = req.body.fechaInput;
    const observaciones = req.body.observaciones.toUpperCase();
    const usuarioInicio = req.body.usuarioInicio;
    const usuarioModifico = req.body.usuarioModifica;
    const usuarioCerro = req.body.usuarioCierra;
    const estacion = req.body.estacion;
    const statusServicio = 'INICIADO';

    connection.query('SELECT siglas FROM colaboradores WHERE noColaborador = ? AND estacion = ?',[noColaborador,estacion], (error, results3)=>{
        if(error){
            console.log(error);
        }else{
            connection.query('SELECT MIN(qr) AS qr FROM qrs WHERE status = ? AND estacion = ?',['DISPONIBLE',estacion], (error, results)=>{
                if(error){
                    console.log(error);
                }else if(results.length === 1){
                    const qrAsignado = results[0].qr;
                    const siglas = results3[0].siglas;
                    connection.query('INSERT INTO serviciosmostrador SET ?',{nombrePax:nombrePax,aerolinea:aerolinea,vuelo:vuelo,noSilla:noSilla,puerta:puerta,ETA:ETA,ASIENTO:asiento,
                                                                             noColaborador:siglas,fechaServicio:fechaServicio,tipoVuelo:tipoVuelo,origenReserva:origenReserva,
                                                                             qrAsignado:qrAsignado,usuarioInicio:usuarioInicio,observaciones:observaciones,
                                                                             estacion:estacion,horaInicio:horaInicio,tipoSilla:tipoSilla,servicioSolicitado:servicioSolicitado,statusServicio:statusServicio}, (error, results2)=>{
                        if(error){
                            console.log(error);
                        }else{
                            const insertId = results2.insertId;
                            connection.query('UPDATE qrs SET status = ?, folioAsignado = ? WHERE qr = ? AND estacion = ?',['OCUPADO',insertId,qrAsignado,estacion], (error, results3)=>{
                                if(error){
                                    console.log(error);
                                }else{
                                    res.redirect('/gestionMostrador');
                                }
                            });   
                        }
                    });   
                }
            });
        }
    });
};