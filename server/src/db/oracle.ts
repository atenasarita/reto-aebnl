import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

export class OracleConnection {
    async getConnection() {
        const user = process.env.ORACLE_USER;
        const password = process.env.ORACLE_PASSWORD;
        const connectString = process.env.ORACLE_CONNECT_STRING;
        const walletPassword = process.env.ORACLE_WALLET_PASSWORD;
        const walletLocation = process.env.TNS_ADMIN || '/tmp/wallet';

        if (!user || !password || !connectString) {
            throw new Error('Faltan variables de entorno de Oracle.');
        }

        return oracledb.getConnection({
            user,
            password,
            connectString,
            walletLocation,
            walletPassword,
        });
    }
}