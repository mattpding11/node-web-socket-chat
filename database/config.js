const mongoose = require('mongoose');



const dbConnection = async() => {

    try {

        await mongoose.connect( process.env.MONGODB_CNN);
    
        console.log('Base de datos online');

    } catch (error) {
        console.log(error);
        console.log('Error a la hora de iniciar la base de datos. La aplicación continuará funcionando sin conexión a DB.');
    }


}



module.exports = {
    dbConnection
}
