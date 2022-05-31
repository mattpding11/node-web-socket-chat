

const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8080/api/auth/'
            : 'https://node-sockets-chat-mpd.herokuapp.com/api/auth/';

let usuario = null;
let socket = null;

// Referencias HTML
const txtUid = document.querySelector('#txtUid')
const txtMensaje = document.querySelector('#txtMensaje')
const ulUsuarios = document.querySelector('#ulUsuarios')
const ulMensaje = document.querySelector('#ulMensaje')
const btnSalir = document.querySelector('#btnSalir')

const validarJWT = async() => {
    const token = localStorage.getItem('token');

    if(token.length <= 10){
        window.location = 'index.html';
        throw new Error('No hay token en el servidor usuario');
    }

    const resp = await fetch(url, {
        headers: {'x-token': token}
    });

    const {usuario: userDB, token:tokenDB} = await resp.json();
    localStorage.setItem("token",tokenDB);
    usuario = userDB;
    
    // Cambia el nombre de la pestaña
    document.title = usuario.nombre;
    // console.log(userDB, tokenDB)

    await conectarSocket();

}

txtMensaje.addEventListener('keyup', ({keyCode}) => {
    
    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if(keyCode != 13){
        return;
    }
    if(mensaje.length === 0){return;}

    socket.emit('enviar-mensaje',{uid,mensaje});

    txtMensaje.value = '';
  
})



const conectarSocket = async() => {

    socket = io({ 
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Sockets online');
    })

    socket.on('disconnect', () => {
        console.log('Sockets offline');
    });

    socket.on('recibir-mensajes', pintarMensajes);

    socket.on('usuarios-activos', pintarUsuarios);

    socket.on('mensaje-privado', (payload) => {
        console.log("Privado",payload);
    });



}

const pintarUsuarios = (usuarios = [] ) => {

    console.log("Users: ",usuarios);

    let usersHtml = '';

    usuarios.forEach(({nombre, uid}) => {

        usersHtml  += `
        <li>

            <p>
                <h5 class="text-success"> ${nombre}</h5>
                <span class="fs-6 text-muted"> ${uid} </span>
            </p>

        </li>
        
        `
    })

    ulUsuarios.innerHTML = usersHtml;

}

const pintarMensajes = (mensajes = [] ) => {

    let mensajesHtml = '';

    mensajes.forEach(({mensaje, nombre}) => {

        mensajesHtml  += `
        <li>

            <p>
                <span style="color:#1095c1;"> ${nombre}:</span>
                <span> ${mensaje} </span>
            </p>

        </li>
        
        `
    });

    ulMensaje.innerHTML = mensajesHtml;

}


btnSalir.addEventListener('click', ()=> {

     localStorage.removeItem('token');

    if(usuario.correo.includes('gmail')){
        // Deslogueo con google
        window.open('https://accounts.google.com/Logout',"_blank","width=640, height=480");
        window.location = 'index.html';
    }else{
        // Desloguero normal
         window.location = 'index.html';
    }

    // // Desloguear usuario de google
    // const auth2 = gapi.auth2.getAuthInstance();
    // auth2.signOut().then( () => {
    //     console.log('User signed out.');
    //     window.location = 'index.html';
    // });
});


const main = async() => {

    // Es importante colocar los parentesis en las funciones ()
    await validarJWT();
} 


main();