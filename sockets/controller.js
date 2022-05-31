const { Socket } = require("socket.io");
const {comprobarJWT} = require('../helpers');
const {ChatMensajes} = require('../models')

const chatMensajes = new ChatMensajes();

const socketController = async(socket = new Socket(), io) => {
    // socket.id, es un objeto por defecto de socket

    // console.log(socket);
    
    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);

    // console.log("usuario", usuario);

    if(!usuario){
        return socket.disconnect();
    } 

    // console.log("usuario conectado", socket.id);


    // Agregar al usuario conectado
    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos',chatMensajes.usuariosArr);
    io.emit('recibir-mensajes',chatMensajes.ultimos10);


    // Conectarlo a una sala especial
    socket.join(usuario.id); // Sala global socket.id, usuario.id

    // console.log(chatMensajes.usuariosArr);

    // Limpar cuando se desconectan
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos',chatMensajes.usuariosArr);
    });
    

    socket.on('enviar-mensaje', ({uid, mensaje}) => {

        if(uid){
            // Mensaje privado con el .to()
            socket.to(uid).emit("mensaje-privado",{de: usuario.nombre, mensaje});
        }else{
            console.log(mensaje)
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }
    });

    socket.emit('cerrar-sesion',usuario);

}

module.exports = {socketController};
