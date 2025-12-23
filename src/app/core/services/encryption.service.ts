import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio de Encriptación y Seguridad
 *
 * Implementa dos tipos de encriptación:
 * 1. Hashing (bcrypt): Para contraseñas - Irreversible
 * 2. Encriptación simétrica (AES): Para datos en localStorage - Reversible
 *
 * @author Marriott International
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  /**
   * Clave secreta para encriptación AES
   * IMPORTANTE: En producción, esta clave debería estar en variables de entorno
   * y ser única por instalación
   */
  private readonly SECRET_KEY = 'M@rr10tt-B0nv0y-2025-S3cur3-K3y';

  /**
   * Salt rounds para bcrypt
   * Número de rondas de hashing (más alto = más seguro pero más lento)
   * Recomendado: 10-12 para aplicaciones normales
   */
  private readonly SALT_ROUNDS = 10;

  constructor() {}

  // ==================== HASHING (Contraseñas) ====================

  /**
   * Genera un hash de la contraseña usando bcrypt
   *
   * ¿Cómo funciona bcrypt?
   * 1. Genera un "salt" aleatorio (texto que se añade a la contraseña)
   * 2. Aplica un algoritmo de hashing múltiples veces (SALT_ROUNDS)
   * 3. El resultado es irreversible - no se puede obtener la contraseña original
   *
   * Ejemplo:
   * Input: "admin123"
   * Output: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
   *
   * @param password - Contraseña en texto plano
   * @returns Promise con el hash generado
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      console.error('Error al hashear contraseña:', error);
      throw new Error('No se pudo procesar la contraseña');
    }
  }

  /**
   * Verifica si una contraseña coincide con su hash
   *
   * ¿Cómo se verifica?
   * 1. bcrypt extrae el salt del hash almacenado
   * 2. Aplica el mismo proceso a la contraseña ingresada
   * 3. Compara ambos hashes
   *
   * @param password - Contraseña en texto plano a verificar
   * @param hashedPassword - Hash almacenado en la base de datos
   * @returns Promise<boolean> - true si coinciden, false si no
   */
  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  }

  // ==================== ENCRIPTACIÓN SIMÉTRICA (AES) ====================

  /**
   * Encripta datos sensibles usando AES (Advanced Encryption Standard)
   *
   * ¿Cómo funciona AES?
   * 1. Toma los datos y la clave secreta
   * 2. Divide los datos en bloques de 128 bits
   * 3. Aplica múltiples rondas de sustitución y permutación
   * 4. Genera un texto cifrado que solo puede descifrarse con la misma clave
   *
   * Ventaja: Es REVERSIBLE - puedes recuperar los datos originales
   * Uso: Para datos en localStorage que necesitamos leer después
   *
   * @param data - Datos a encriptar (objeto convertido a JSON)
   * @returns String encriptado
   */
  encryptData(data: any): string {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(
        jsonData,
        this.SECRET_KEY
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Error al encriptar datos:', error);
      throw new Error('No se pudieron encriptar los datos');
    }
  }

  /**
   * Desencripta datos previamente encriptados con AES
   *
   * @param encryptedData - String encriptado
   * @returns Datos originales (objeto parseado desde JSON)
   */
  decryptData(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const jsonData = decrypted.toString(CryptoJS.enc.Utf8);

      if (!jsonData) {
        throw new Error('Datos corruptos o clave incorrecta');
      }

      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error al desencriptar datos:', error);
      throw new Error('No se pudieron desencriptar los datos');
    }
  }

  // ==================== UTILIDADES DE LOCALSTORAGE SEGURO ====================

  /**
   * Guarda datos de forma segura en localStorage
   * Los datos se encriptan antes de almacenarse
   *
   * @param key - Clave para identificar los datos
   * @param data - Datos a guardar
   */
  setSecureItem(key: string, data: any): void {
    try {
      const encrypted = this.encryptData(data);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Error al guardar ${key} de forma segura:`, error);
    }
  }

  /**
   * Recupera datos encriptados desde localStorage
   *
   * @param key - Clave de los datos
   * @returns Datos desencriptados o null si no existen
   */
  getSecureItem(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }
      return this.decryptData(encrypted);
    } catch (error) {
      console.error(`Error al recuperar ${key}:`, error);
      return null;
    }
  }

  /**
   * Elimina un item de localStorage
   *
   * @param key - Clave del item a eliminar
   */
  removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpia todos los datos de localStorage
   */
  clearSecureStorage(): void {
    localStorage.clear();
  }

  // ==================== GENERACIÓN DE TOKENS ====================

  /**
   * Genera un token aleatorio seguro
   * Útil para tokens de sesión, códigos de verificación, etc.
   *
   * @param length - Longitud del token (default: 32)
   * @returns Token aleatorio en formato hexadecimal
   */
  generateToken(length: number = 32): string {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }
}
