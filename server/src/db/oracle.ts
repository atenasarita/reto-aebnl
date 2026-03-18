import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

process.env.TNS_ADMIN = process.env.ORACLE_TNS_ADMIN;

export class OracleConnection {
    async getConnection() {
        const user = process.env.ORACLE_USER;
        const password = process.env.ORACLE_PASSWORD;
        const connectString = process.env.ORACLE_CONNECT_STRING;
        const walletPath = process.env.ORACLE_WALLET_PATH;
        const walletPassword = process.env.ORACLE_WALLET_PASSWORD;

        if (!user || !password || !connectString || !walletPath || !walletPassword) {
            throw new Error('Faltan variables de entorno de Oracle.');
        }

        return oracledb.getConnection({
            user,
            password,
            connectString,
            configDir: walletPath,
            walletLocation: walletPath,
            walletPassword,
        });
    }
}

export async function testConnection() {
    console.log("executing testConnection");

    const connectionService = new OracleConnection();
    let connection;
    try {
        connection = await connectionService.getConnection();
        console.log("Successfully connected to Oracle Database");
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}



