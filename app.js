try {
    process.loadEnvFile();
} catch (error) {
    // Si no encuentra el .env, asume que está en la nube usando variables de entorno inyectadas
}

const Server = require("./models/server");

const server = new Server();

server.listen();
