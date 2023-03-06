/**
 * [JSON Web Algorithms (JWA)](https://www.rfc-editor.org/rfc/rfc7518.html)
 * */
type JSON_WEB_ALGORITHM = {
  /**
   * Key type
   */
  kty: string;
  /**
   * Algorithm
   */
  algo: string;
}

/**
 * Supported cryptographic algorithms
 */
export const CRYPTO_ALGORITHMS = {
  AES: {
    name: "AES-GCM", // aes in galois counter mode
    length: 256, // 256 bit key
    tagLength: 128, // 128 bit tag
    jwk: {
      kty: "oct",
      algo: "A256GCM"
    } as JSON_WEB_ALGORITHM
  },
  ECDH: {
    name: "ECDH", // elliptic curve diffie hellman
    namedCurve: "P-256", // prime256v1 curve, at the very least, as recommended by [NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf)
    jwk: {
      kty: "EC",
      algo: "ECDH-ES"
    } as JSON_WEB_ALGORITHM
  },
  PBKDF2: {
    name: "PBKDF2", // password based key derivation function 2
    hash: "SHA-512", // sha256 hash
    iterations: 100000, // 100000 iterations
    jwk: {
      kty: "oct",
      algo: "A256GCM" // note: the algorithm used to prepare the key is "PBES2-HS512+A256" but the actual key is A256GCM
    } as JSON_WEB_ALGORITHM
  },
  HASH: "SHA-512" // sha512 hash
}

/**
 * Default configuration properties for the web crypto api
 */
export const CRYPTO_CONFIG = {
  SYMMETRIC: {
    algorithm: CRYPTO_ALGORITHMS.AES,
    exportable: true, // key can be exported
    usages: [ "encrypt", "decrypt" ] as KeyUsage[] // key can be used for encryption and decryption (type assertion)
  },
  ASYMMETRIC: {
    algorithm: CRYPTO_ALGORITHMS.ECDH,
    exportable: true, // key can be exported
    usages: [ "deriveKey" ] as KeyUsage[] // key can be used for generating other keys (type assertion)
  },
  HASH: {
    algorithm: CRYPTO_ALGORITHMS.HASH
  }
}
