/**
 * Módulo de Conexão com Oracle
 * Autor: Rafael Leal
 */

import oracledb from 'oracledb';
import { dbConfig, validateDatabaseConfig } from '../config/database';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool: oracledb.Pool | null = null;

export async function initializeDatabase(): Promise<void> {
  try {
    const validation = validateDatabaseConfig();
    if (!validation.valid) {
      throw new Error('Erro: Verifique as configurações do .env');
    }

    console.log('Conectando ao Oracle...');
    console.log('Connection string:', dbConfig.connectString);
    pool = await oracledb.createPool(dbConfig);
    console.log('✅ Conectado com sucesso!');
    
    // Teste de conexão
    const conn = await pool.getConnection();
    await conn.close();
    console.log('✅ Teste de conexão bem-sucedido!');
  } catch (error) {
    console.error('Erro ao conectar:', error);
    throw error;
  }
}

export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) throw new Error('Pool não inicializado');
  return await pool.getConnection();
}

export async function executeQuery<T = any>(
  sql: string,
  binds: any = [],
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  const connection = await getConnection();
  try {
    return await connection.execute<T>(sql, binds, options);
  } finally {
    await connection.close();
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
  }
}
