const mysql = require('mysql2');

function createConnection() {
  const connection = mysql.createConnection({
    host: 'ossca-2023-software-do-user-14718390-0.c.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'AVNS_aHlAvJfQrfj8M35-uKb',
    database: 'orion',
    port: 25060
    
  });

  connection.connect((error) => {
    if (error) {
      console.error('Error de conexión a la base de datos:', error);
    } else {
      console.log('Conexión exitosa a la base de datos');
    }
  });

  
  

  return connection;
}

module.exports = createConnection;
