# End to end encrypted messaging web app

Using smart contract for authentication and integrity checking. 

## How it works
After user registration, private key, public key, and account address are generated. Private key is encrypted and stored locally. Public key and account address are stored in the server database.

When a client sends a message, smart contract method is invoked to store its checksum. Afterward, the message is duplicated one copy is encrypted with the sender's public key and the second with the receivers. Both encryptions are stored in server DB in a single message object.

Messages are received by polling server DB and smart contract contents. When the client finds a message, it is decrypted and checked against the smart contract checksum. Only then it is shown to the client.

## How to use it
- In Register tab you need to register unique useranme and password.
- In Messages tab you can see your contacts.
- You need to add founds to your account, either send ether from faucet to the address in contacsts or press Reqest founds. The faucet needs to be in Rinkeby testnet.
- Then you can create new contact by pressing Create a new Contact, in the window shown you can fill just username and press save. If it is valid, address will be assigned to it.
- After pressing on the new contact you can excahnge messages, you will be added to their contacts after first message.

#### Dependencies:
  docker-compose <br>
  docker <br>
  truffle <br>
  python <br>

#### Setup:
  Instructions are described in wiki.
  
#### Starting server:
    docker-compose up
  
 #### Execution:
   https://slavka.one
