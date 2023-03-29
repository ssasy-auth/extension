# architecture

The purpose of this extension is to provide a user-friendly way to interact with [this-oliver/ssasy](https://github.com/this-oliver/ssasy), a self-sovereign user authentication scheme that uses public key cryptography to provide a secure and practical alternative to federated identities and passwords.

In order to acheive this goal, the extension must be able to:

- [x] Generate a private key and store it securely
- [x] Communicate with websites that want to authenticate the user
- [x] Handle challenge-response authentication if the user approves an authentication request

The tasks above are implemented using five 'components':

1. `core` - handles the generation, storage and retrieval of the private key
2. `content-script` - listens and responds to authentication requests from websites
3. `background-script` - prompts the user to approve or deny authentication requests
4. `popup` - interact with the extension (e.g. approve/deny authentication requests)
5. `options` - configure the extension settings (e.g. change password, dark mode, etc.)

To learn more about the extension, check out the [extension documentation](./extension.md).

## extra: bridge component

The `bridge` component abstracts the complex logic that enables web applications to communicate with this extension. This includes defining the type of messages that can be sent and received, and the logic for sending and receiving messages.

To learn more about the bridge component, check out the [bridge documentation](../src/bridge/README.md).
