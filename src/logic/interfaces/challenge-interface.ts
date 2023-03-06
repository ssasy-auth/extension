import type { PublicKey } from "./key-interface";

/**
 * @interface Challenge
 * @description Represents the authentication challenge
 */
export interface Challenge {
  /**
   * A random nonce
   */
  nonce: Uint8Array;

  /**
   * A digest of the nonce
   * 
   * TODO: improve this challenge digest
   */
  solution?: string;

  /**
   * The timestamp of the challenge
   */
  timestamp: number;

  /**
   * The public key of the user that created the challenge
   */
  verifier: PublicKey;

  /**
   * The public key of the user that will solve the challenge
   * */
  claimant: PublicKey;
}

/**
 * @interface isChallenge
 * @description Type guard for the Challenge interface
 */
export type isChallenge = (challenge: unknown) => challenge is Challenge;
