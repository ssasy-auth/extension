import { WebCryptoLib } from "../config/native";
import { CHALLENGE_MAX_AGE } from "../config/challenge";
import { CryptoModule } from "./crypto-mod";
import { KeyModule, KeyChecker } from "./key-mod";
import { KeyType } from "../interfaces/key-interface";
import type { Challenge } from "../interfaces/challenge-interface";
import type { PrivateKey, PublicKey } from "../interfaces/key-interface";

/**
 * Error messages for the challenge operations
 * */
export const CHALLENGE_ERROR_MESSAGE = {
  INVALID_VERIFIER_PRIVATE_KEY: "Verifier's private key is not valid",
  INVALID_CLAIMANT_PUBLIC_KEY: "Claimant's public key is not valid",
  INVALID_CLAIMANT_PRIVATE_KEY: "Claimant's private key is not valid",
  EXPIRED_CHALLENGE: "Challenge has expired",
  MISSING_KEY: "Key is missing",
  MISSING_CHALLENGE: "Challenge is missing",
  CLAIMANT_MISMATCH: "Claimant does not match the challenge claimant",
  VERIFIER_MISMATCH: "Verifier does not match the challenge verifier"
};

/**
 * Operations for authenticating ownership of a public key with challenges
 */
export const ChallengeModule = {
  /**
	 * Returns a random nonce
	 * @returns nonce
	 */
  generateNonce(): Uint8Array {
    return WebCryptoLib.getRandomValues(new Uint8Array(16));
  },

  /**
	 * Returns a challenge object
	 *
	 * The challenge is a combination of a nonce, timestamp, and the verifier's public key such that the
	 * string format looks like this: <nonce>::<timestamp>::<verifier>
	 *
	 * @param verifier - the user who created the challenge
	 * @param claimant - the user who will solve the challenge
	 */
  async generateChallenge(
    verifier: PrivateKey,
    claimant: PublicKey
  ): Promise<Challenge> {
    if (!verifier || !claimant) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.MISSING_KEY);
    }

    if (
      !KeyChecker.isAsymmetricKey(verifier) ||
			verifier.type !== KeyType.PrivateKey
    ) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.INVALID_VERIFIER_PRIVATE_KEY);
    }

    if (
      !KeyChecker.isAsymmetricKey(claimant) ||
			claimant.type !== KeyType.PublicKey
    ) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.INVALID_CLAIMANT_PUBLIC_KEY);
    }

    // generate verifier public key
    const verifierPublicKey = await KeyModule.generatePublicKey({
      privateKey: verifier
    });

    // create challenge
    return {
      nonce: ChallengeModule.generateNonce(),
      timestamp: Date.now(),
      verifier: verifierPublicKey,
      claimant: claimant
    } as Challenge;
  },

  /**
	 * Returns a challenge with populated solution property.
	 * The solution should be a base64 encoded string of the hash of the nonce.
	 *
	 * @param claimant - the user who will solve the challenge
	 * @param challengeString - the challenge to solve
	 */
  async solveChallenge(
    claimant: PrivateKey,
    challenge: Challenge
  ): Promise<Challenge> {
    if (!claimant) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.MISSING_KEY);
    }

    if (!challenge) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.MISSING_CHALLENGE);
    }

    if (
      !KeyChecker.isAsymmetricKey(claimant) ||
			claimant.type !== KeyType.PrivateKey
    ) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.INVALID_CLAIMANT_PRIVATE_KEY);
    }

    const claimantPublicKey = await KeyModule.generatePublicKey({
      privateKey: claimant
    });
    if (!(await KeyChecker.isSameKey(claimantPublicKey, challenge.claimant))) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.CLAIMANT_MISMATCH);
    }

    if (ChallengeChecker.timestampExpired(challenge.timestamp)) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.EXPIRED_CHALLENGE);
    }

    // create solution = hash(nonce)
    challenge.solution = await CryptoModule.hash(challenge.nonce.toString());

    return challenge;
  },

  /**
	 * Returns true if the challenge was solved correctly.
	 * To be solved correctly, the solution property of the challenge must be a hash of the nonce in base64 format.
	 *
	 * @param verifier - the user who created the challenge
	 * @param challenge - the challenge to verify
	 */
  async verifyChallenge(
    verifier: PrivateKey,
    challenge: Challenge
  ): Promise<boolean> {
    if (!verifier) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.MISSING_KEY);
    }

    if (!challenge) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.MISSING_CHALLENGE);
    }

    if (
      !KeyChecker.isAsymmetricKey(verifier) ||
			verifier.type !== KeyType.PrivateKey
    ) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.INVALID_VERIFIER_PRIVATE_KEY);
    }

    const verifierPublicKey = await KeyModule.generatePublicKey({
      privateKey: verifier
    });
    if (!(await KeyChecker.isSameKey(verifierPublicKey, challenge.verifier))) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.VERIFIER_MISMATCH);
    }

    if (ChallengeChecker.timestampExpired(challenge.timestamp)) {
      throw new Error(CHALLENGE_ERROR_MESSAGE.EXPIRED_CHALLENGE);
    }

    if (!challenge.solution) {
      return false;
    }

    // verify that the solution is a hash of nonce
    const hashedNonce = await CryptoModule.hash(challenge.nonce.toString());

    return hashedNonce === challenge.solution;
  }
};

export const ChallengeChecker = {
  /**
   * Returns true if the challenge is valid
   * 
   * @param obj - the challenge to check
   * @returns boolean
   */
  isChallenge(obj: unknown): boolean {
    const challenge = obj as Challenge;

    if (!challenge.nonce || !(challenge.nonce instanceof Uint8Array)) {
      return false;
    }

    if (typeof challenge.timestamp !== "number") {
      return false;
    }
    
    if (!KeyChecker.isAsymmetricKey(challenge.verifier) || challenge.verifier.type !== KeyType.PublicKey) {
      return false;
    }
    
    if (!KeyChecker.isAsymmetricKey(challenge.claimant) || challenge.claimant.type !== KeyType.PublicKey) {
      return false;
    }
    
    if (challenge.solution && typeof challenge.solution !== "string") {
      return false;
    }

    return true;
  },

  /**
	 * Returns true if the challenge has expired
	 *
	 * @param timestamp - the timestamp of the challenge
	 * @returns boolean
	 */
  timestampExpired(timestamp: number): boolean {
    const now = Date.now();
    return now - timestamp > CHALLENGE_MAX_AGE;
  }
};
