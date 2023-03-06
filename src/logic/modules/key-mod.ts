import { WebCryptoLib } from "../config/native";
import { CRYPTO_ALGORITHMS, CRYPTO_CONFIG } from "../config/algorithm";
import { KeyType } from "../interfaces/key-interface";
import type { GenericKey, JsonWebKey, SecretKey, PassKey, PrivateKey, PublicKey, SharedKey, RawKey } from "../interfaces/key-interface";

export const KEY_ERROR_MESSAGE = {
  INVALID_PASSPHRASE: "Passphrase is not a valid string",
  INVALID_PASSPHRASE_SALT: "Passphrase salt is not a valid Uint8Array",
  INVALID_ASYMMETRIC_KEY: "Key is not a valid asymmetric key (ECDH)",
  INVALID_PRIVATE_KEY: "Key is not a private key",
  INVALID_PUBLIC_KEY: "Key is not a public key",
  INVALID_KEY: "Key is not a valid key",
  INVALID_RAW_KEY: "Key is not a valid raw key",
  DUPLICATE_SHARED_KEY_PARAMS: "Cannot generate a shared key with the same key type"
};

interface GenKeyParams {
  /**
   * domain to generate the key for
   */
  domain?: string;
}

interface GenPassKeyParams extends GenKeyParams {
  /**
   * passphrase to generate the key from
   */
  passphrase: string;

  /**
   * salt to use to derive the key from the passphrase
   */
  salt?: Uint8Array;

  /**
   * number of iterations to use to derive the key from the passphrase
   * */
  iterations?: number;
}

interface GenPublicKeyParams extends GenKeyParams {
  /**
   * private source key
   */
  privateKey: PrivateKey;
}

interface GenSharedKeyParams extends GenKeyParams {
  /**
   * a private ECDH key
   */
  privateKey: PrivateKey;
  /**
   * a public ECDH key
   */
  publicKey: PublicKey;
}

/**
 * Operations for generating symmetric and asymmetric keys 
 */
export const KeyModule = {
  /**
   * Returns a symmetric key using the AES-GCM cryptography algorithm.
   * This operation is for **symmetric** key cryptography.
   *
   * @returns secret key
   * */
  async generateKey(params?: GenKeyParams): Promise<SecretKey> {
    const cryptoKey = await WebCryptoLib.subtle.generateKey(
      CRYPTO_CONFIG.SYMMETRIC.algorithm,
      CRYPTO_CONFIG.SYMMETRIC.exportable,
      CRYPTO_CONFIG.SYMMETRIC.usages
    );

    return {
      type: KeyType.SecretKey,
      domain: params?.domain,
      crypto: cryptoKey
    };
  },

  /**
   * Returns a symmetric key using the AES-GCM cryptography algorithm and a passphrase.
   * This operation is for **symmetric** key cryptography.
   *
   * @returns password key
   * */
  async generatePassKey(params: GenPassKeyParams): Promise<PassKey> {
    const { domain, passphrase, salt, iterations } = params;

    if (typeof passphrase !== "string") {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_PASSPHRASE);
    }

    if (salt && !(salt instanceof Uint8Array)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_PASSPHRASE_SALT);
    }

    // encode passphrase
    const encoder = new TextEncoder();
    const encodedPassphrase = encoder.encode(passphrase);

    // prepare key material for PBKDF2
    const keyMaterial = await WebCryptoLib.subtle.importKey(
      "raw",
      encodedPassphrase,
      CRYPTO_ALGORITHMS.PBKDF2.name,
      false,
      [ "deriveBits", "deriveKey" ]
    );

    // prepare salt for key with provided salt or generate random salt
    const keySalt = salt || WebCryptoLib.getRandomValues(new Uint8Array(16));

    // prepare iterations for key with provided iterations or use default iterations
    const keyIterations = iterations || CRYPTO_ALGORITHMS.PBKDF2.iterations;

    // generate key from key material
    const cryptoKey = await WebCryptoLib.subtle.deriveKey(
      {
        ...CRYPTO_ALGORITHMS.PBKDF2,
        salt: keySalt,
        iterations: keyIterations
      },
      keyMaterial,
      CRYPTO_CONFIG.SYMMETRIC.algorithm,
      CRYPTO_CONFIG.SYMMETRIC.exportable,
      CRYPTO_CONFIG.SYMMETRIC.usages
    );

    return {
      type: KeyType.PassKey,
      domain: domain,
      crypto: cryptoKey,
      salt: keySalt,
      iterations: keyIterations,
      hash: CRYPTO_ALGORITHMS.PBKDF2.hash
    };
  },

  /**
   * Returns a new private and public key pair using the ECDH cryptography algorithm.
   * This operation is for **asymmetric** key cryptography.
   *
   * @returns private key
   * */
  async generatePrivateKey(params?: GenKeyParams): Promise<PrivateKey> {
    const { privateKey } = await WebCryptoLib.subtle.generateKey(
      CRYPTO_CONFIG.ASYMMETRIC.algorithm,
      CRYPTO_CONFIG.ASYMMETRIC.exportable,
      CRYPTO_CONFIG.ASYMMETRIC.usages
    );

    return {
      type: KeyType.PrivateKey,
      domain: params?.domain,
      crypto: privateKey
    };
  },

  /**
   * Returns a public key that is derived from the private source key. At a lower level, the public key
   * is actually an AES key that is derived from the private key.
   * This operation is for **asymmetric** key cryptography.
   *
   * @returns public key
   */
  async generatePublicKey(params: GenPublicKeyParams): Promise<PublicKey> {
    const { domain, privateKey } = params;

    if (!KeyChecker.isAsymmetricKey(privateKey)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_ASYMMETRIC_KEY);
    }

    if (privateKey.type !== KeyType.PrivateKey) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_PRIVATE_KEY);
    }

    // convert private key to public key
    const privateJsonWebKey = await WebCryptoLib.subtle.exportKey(
      "jwk",
      privateKey.crypto
    );
    // delete private key properties
    delete privateJsonWebKey.d;

    // import public key from JsonWebKey (without private key properties)
    const publicKey = await WebCryptoLib.subtle.importKey(
      "jwk",
      privateJsonWebKey,
      CRYPTO_CONFIG.ASYMMETRIC.algorithm,
      CRYPTO_CONFIG.ASYMMETRIC.exportable,
      CRYPTO_CONFIG.ASYMMETRIC.usages
    );

    return {
      type: KeyType.PublicKey,
      domain: domain,
      crypto: publicKey
    };
  },

  /**
   * Returns a shared key that is derived from the private key of one party
   * and the public key of another party.
   * This operation is for **asymmetric** key cryptography.
   *
   * @returns shared key
   */
  async generateSharedKey(params: GenSharedKeyParams): Promise<SharedKey> {
    const { domain, privateKey, publicKey } = params;

    if (!KeyChecker.isAsymmetricKey(privateKey)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_PRIVATE_KEY);
    }

    if (!KeyChecker.isAsymmetricKey(publicKey)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_PUBLIC_KEY);
    }

    if ((privateKey as GenericKey).type === (publicKey as GenericKey).type) {
      throw new Error(KEY_ERROR_MESSAGE.DUPLICATE_SHARED_KEY_PARAMS);
    }

    const sharedKey = await WebCryptoLib.subtle.deriveKey(
      {
        name: CRYPTO_CONFIG.ASYMMETRIC.algorithm.name,
        public: publicKey.crypto
      },
      privateKey.crypto,
      CRYPTO_CONFIG.SYMMETRIC.algorithm,
      CRYPTO_CONFIG.SYMMETRIC.exportable,
      CRYPTO_CONFIG.SYMMETRIC.usages
    );

    return {
      type: KeyType.SharedKey,
      domain: domain,
      crypto: sharedKey
    };
  },

  /**
   * Returns a json web key representation of the key.
   * This operation is for **symmetric** and **asymmetric** key cryptography.
   *
   * @param key - key to export
   * @returns json web key
   */
  async exportKey(key: GenericKey): Promise<RawKey> {
    if (!KeyChecker.isKey(key)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_KEY);
    }

    const jsonKey: JsonWebKey = await WebCryptoLib.subtle.exportKey(
      "jwk",
      key.crypto
    );

    if (key.type === KeyType.PassKey) {
      return {
        type: key.type,
        domain: key.domain,
        crypto: jsonKey,
        hash: (key as PassKey).hash,
        salt: (key as PassKey).salt,
        iterations: (key as PassKey).iterations
      };
    }

    return {
      type: key.type,
      domain: key.domain,
      crypto: jsonKey
    };
  },

  /**
   * Returns a key from the json web key representation.
   * This operation is for **symmetric** and **asymmetric** key cryptography.
   *
   * @param rawKey - json web key to import
   * @returns key
   */
  async importKey(
    rawKey: RawKey
  ): Promise<SecretKey | PassKey | PrivateKey | PublicKey> {
    if (!KeyChecker.isRawKey(rawKey as GenericKey)) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_RAW_KEY);
    }

    if (
      rawKey.type === KeyType.PrivateKey ||
      rawKey.type === KeyType.PublicKey
    ) {
      const asymmetricKey = await WebCryptoLib.subtle.importKey(
        "jwk",
        rawKey.crypto,
        CRYPTO_CONFIG.ASYMMETRIC.algorithm,
        CRYPTO_CONFIG.ASYMMETRIC.exportable,
        CRYPTO_CONFIG.ASYMMETRIC.usages
      );

      const key = {
        type: rawKey.type,
        domain: rawKey.domain,
        crypto: asymmetricKey
      };

      return rawKey.type === KeyType.PrivateKey
        ? (key as PrivateKey)
        : (key as PublicKey);
    } else {
      const cryptoKey = await WebCryptoLib.subtle.importKey(
        "jwk",
        rawKey.crypto,
        CRYPTO_CONFIG.SYMMETRIC.algorithm,
        CRYPTO_CONFIG.SYMMETRIC.exportable,
        CRYPTO_CONFIG.SYMMETRIC.usages
      );

      if (rawKey.type === KeyType.PassKey) {
        return {
          type: rawKey.type,
          domain: rawKey.domain,
          crypto: cryptoKey,
          hash: (rawKey as PassKey).hash,
          salt: (rawKey as PassKey).salt,
          iterations: (rawKey as PassKey).iterations
        } as PassKey;
      }

      return {
        type: rawKey.type,
        domain: rawKey.domain,
        crypto: cryptoKey
      } as SecretKey;
    }
  }
};

/**
 * Operations for validating cryptographic keys
 * */
export const KeyChecker = {
  /**
 * Returns true if key is a valid Key
 *
 * @param key - key to check
 * @returns boolean
 */
  isKey(key: GenericKey): boolean {
    if (!key) {
      return false;
    }

    if (!key.type ||
      (
        key.type !== KeyType.SecretKey &&
        key.type !== KeyType.PassKey &&
        key.type !== KeyType.PrivateKey &&
        key.type !== KeyType.PublicKey &&
        key.type !== KeyType.SharedKey
      )) {
      // return false if key type is not present or is not a valid key type
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isCryptoKey(obj: any): obj is CryptoKey {
      return typeof obj === "object" && obj !== null &&
        typeof obj.type === "string" &&
        typeof obj.algorithm === "object" &&
        typeof obj.extractable === "boolean" &&
        typeof obj.usages === "object" &&
        typeof obj.algorithm.name === "string";
    }

    // return false if key crypto is not present or is not a valid crypto key
    if (
      !key.crypto || // key.crypto is not present
      (!isCryptoKey(key.crypto) && !KeyChecker.isRawKey(key)) // key.crypto is not a valid crypto key or raw key
    ) {
      return false;
    }

    return true;
  },

  /**
 * Returns true if the key is a valid raw key
 *
 * @param key key
 * @returns boolean
 */
  isRawKey(key: GenericKey): boolean {
    if (!key) {
      return false;
    }

    // return false if key does not have crypto property
    if (!key.crypto) {
      return false;
    }

    const crypto = key.crypto as JsonWebKey;

    if (
      !crypto.kty || // rawKey.crypto.kty is not present
      !crypto.key_ops || // rawKey.crypto.key_ops is not present
      // rawKey.crypto.kty is oct and k property is not present
      (crypto.kty === CRYPTO_ALGORITHMS.AES.jwk.kty &&
        !crypto.k &&
        // rawKey.crypto.kty is EC and x, y property are not present (d is optional)
        crypto.kty === CRYPTO_ALGORITHMS.ECDH.jwk.kty &&
        (!crypto.x || !crypto.y))
    ) {
      return false;
    }

    return true;
  },

  /**
 * Returns true if key is a valid symmetric key (AES)
 *
 * @param key - key to check
 * @returns boolean
 */
  isSymmetricKey(key: GenericKey): boolean {
    if (!KeyChecker.isKey(key)) {
      return false;
    }

    if (
      key.type !== KeyType.SecretKey &&
      key.type !== KeyType.PassKey &&
      key.type !== KeyType.SharedKey
    ) {
      return false;
    }

    if (key.crypto.algorithm.name !== CRYPTO_ALGORITHMS.AES.name) {
      return false;
    }

    return true;
  },

  /**
 * Returns true if key is a valid asymmetric key (ECDH)
 *
 * @param key - key to check
 * @returns boolean
 */
  isAsymmetricKey(key: GenericKey): boolean {
    if (!KeyChecker.isKey(key)) {
      return false;
    }

    if (key.type !== KeyType.PrivateKey && key.type !== KeyType.PublicKey) {
      return false;
    }

    if (key.crypto.algorithm.name !== CRYPTO_ALGORITHMS.ECDH.name) {
      return false;
    }

    return true;
  },

  /**
 * Returns true if the public keys are the same (deep comparison)
 * 
 * @param key1 - key to compare
 * @param key2 - key to compare
 * @returns boolean
 */
  async isSameKey(key1: GenericKey, key2: GenericKey): Promise<boolean> {
    if (
      !KeyChecker.isKey(key1) ||
      !KeyChecker.isKey(key2) ||
      KeyChecker.isRawKey(key1) ||
      KeyChecker.isRawKey(key2)
    ) {
      throw new Error(KEY_ERROR_MESSAGE.INVALID_KEY);
    }

    if (key1.type !== key2.type) {
      return false;
    }

    if (key1.domain !== key2.domain) {
      return false;
    }

    // convert the keys to buffers
    const rawKey1 = await KeyModule.exportKey(key1);
    const rawKey2 = await KeyModule.exportKey(key2);

    // compare the json objects
    return JSON.stringify(rawKey1) === JSON.stringify(rawKey2);
  }
};
