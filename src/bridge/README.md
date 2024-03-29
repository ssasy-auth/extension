# ssasy extension bridge

`ssasy-ext` is a browser extension that offers a secure, usable and scalable alternative to existing password and federation-based user authentication schemes.

The `bridge` component abstracts the complex logic that web applications would need to implement if they were to communicate with the `ssasy-ext`. The absraction encompasses:

- the interface for messages (see [interface.ts](./src/interface.ts))
- the logic for sending and receiving messages (see [bridge.ts](./src/bridge.ts))

## usage

```ts
import { Bridge } from 'ssasy-ext-bridge';

// check if the extension is installed
const extensionInstalled: boolean = await Bridge.isExtensionInstalled(); // returns true or false

if(extensionInstalled === true){

  const requestMode: string = 'login'; // or 'registration'
  
  // request the user's public key
  const publicKey: string = await Bridge.requestPublicKey(requestMode); // returns the user's public key

  // ... generate a challenge with the user's public key 

  // initiate challenge-response
  const challengeResponse: string = await Bridge.requestChallengeResponse(requestMode, challenge); // returns the challenge response

  // ... verify the challenge response
}
```
