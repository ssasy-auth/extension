import type { PublicKey } from "./key-interface";

export interface Ciphertext {
  /**
   * Encrypted data
   */
  data: string;
  
  /**
   * Initialization vector used to encrypt the data
   */
  iv: Uint8Array;

  /**
   * Salt (initialization vector) used to build passkey
   */
  salt?: Uint8Array;

  /**
   * The public key of the sender
   */
  sender?: PublicKey;

  /**
   * The public key of the recipient
   */
  recipient?: PublicKey;
}

export type isCipherText = (ciphertext: unknown) => ciphertext is Ciphertext;