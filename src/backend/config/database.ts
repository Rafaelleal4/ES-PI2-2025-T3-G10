/**
 * Configurações do Banco de Dados Oracle
 * Autor: Rafael Leal
 * 
 * NOTA: O dotenv.config() é chamado no index.ts principal
 */

export const dbConfig = {
  user: process.env.ORACLE_USER || '',
  password: process.env.ORACLE_PASSWORD || '',
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SID}`,
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  queueTimeout: 60000,
  connectTimeout: 90
};

export function validateDatabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.ORACLE_USER) errors.push('ORACLE_USER não configurado');
  if (!process.env.ORACLE_PASSWORD) errors.push('ORACLE_PASSWORD não configurado');
  if (!process.env.ORACLE_HOST) errors.push('ORACLE_HOST não configurado');
  if (!process.env.ORACLE_PORT) errors.push('ORACLE_PORT não configurado');
  if (!process.env.ORACLE_SID) errors.push('ORACLE_SID não configurado');
  
  return { valid: errors.length === 0, errors };
}
