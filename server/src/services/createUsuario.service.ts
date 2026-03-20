import oracledb from 'oracledb';
import bcrypt from 'bcryptjs';
import { UsuariosDBService } from '../interfaces/dbService';
import { CreateUsuarioInput, LoginUsuarioInput, Usuario } from '../types/usuarios.types';
import { OracleConnection } from '../db/oracle';

const SALT_ROUNDS = 10;

export class OracleDBService implements UsuariosDBService {
	oracleConnection: OracleConnection;

	constructor(oracleConnection: OracleConnection = new OracleConnection()) {
		this.oracleConnection = oracleConnection;
	}

	async createUsuario(usuario: CreateUsuarioInput): Promise<Usuario> {
		let connection: oracledb.Connection | undefined;

		try {
			connection = await this.oracleConnection.getConnection();
			const contrasenaHash = await bcrypt.hash(usuario.contrasena, SALT_ROUNDS);

			const insertUsuarioSql = `
				INSERT INTO Usuarios (usuario, rol, nombres, apellido_paterno, apellido_materno)
				VALUES (:usuario, :rol, :nombres, :apellido_paterno, :apellido_materno)
				RETURNING id_usuario INTO :id_usuario
			`;

			const insertUsuarioResult = await connection.execute(insertUsuarioSql, {
				usuario: usuario.usuario,
				rol: usuario.rol,
				nombres: usuario.nombres,
				apellido_paterno: usuario.apellido_paterno,
				apellido_materno: usuario.apellido_materno,
				id_usuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
			}, { autoCommit: false });

			const outBinds = insertUsuarioResult.outBinds as { id_usuario: number[] | number };
			const idUsuario = Array.isArray(outBinds.id_usuario)
				? outBinds.id_usuario[0]
				: outBinds.id_usuario;

			await connection.execute(
				`
					INSERT INTO Usuarios_seguridad (id_usuario, contrasena_hash)
					VALUES (:id_usuario, :contrasena_hash)
				`,
				{
					id_usuario: idUsuario,
					contrasena_hash: contrasenaHash,
				},
				{ autoCommit: false }
			);

			await connection.commit();

			return {
				id_usuario: idUsuario,
				usuario: usuario.usuario,
				rol: usuario.rol,
				nombres: usuario.nombres,
				apellido_paterno: usuario.apellido_paterno,
				apellido_materno: usuario.apellido_materno,
			};
		} catch (error) {
			if (connection) {
				await connection.rollback();
			}
			throw error;
		} finally {
			if (connection) {
				await connection.close();
			}
		}
	}

	async loginUsuario(usuario: LoginUsuarioInput): Promise<Usuario> {
		let connection: oracledb.Connection | undefined;

		try {
			connection = await this.oracleConnection.getConnection();

			const loginSql = `
				SELECT u.id_usuario, u.usuario, u.rol, u.nombres, u.apellido_paterno, u.apellido_materno, us.contrasena_hash
				FROM Usuarios u
				INNER JOIN Usuarios_seguridad us ON us.id_usuario = u.id_usuario
				WHERE u.usuario = :usuario
			`;

			const result = await connection.execute(loginSql, {
				usuario: usuario.usuario,
			}, {
				outFormat: oracledb.OUT_FORMAT_OBJECT,
			});

			const row = result.rows?.[0] as {
				ID_USUARIO: number;
				USUARIO: string;
				ROL: 'administrador' | 'operador';
				NOMBRES: string;
				APELLIDO_PATERNO: string;
				APELLIDO_MATERNO: string;
				CONTRASENA_HASH: string;
			} | undefined;

			if (!row) {
				const error = new Error('Usuario o contraseña incorrectos.') as Error & { code?: string };
				error.code = 'INVALID_CREDENTIALS';
				throw error;
			}

			const isPasswordValid = await bcrypt.compare(usuario.contrasena, row.CONTRASENA_HASH);
			if (!isPasswordValid) {
				const error = new Error('Usuario o contraseña incorrectos.') as Error & { code?: string };
				error.code = 'INVALID_CREDENTIALS';
				throw error;
			}

			return {
				id_usuario: row.ID_USUARIO,
				usuario: row.USUARIO,
				rol: row.ROL,
				nombres: row.NOMBRES,
				apellido_paterno: row.APELLIDO_PATERNO,
				apellido_materno: row.APELLIDO_MATERNO,
			};
		} finally {
			if (connection) {
				await connection.close();
			}
		}
	}
}
