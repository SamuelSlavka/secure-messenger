# End to end encrypted messaging web app

using Ethereum smart contract for authentication and integrity checking. 

## How it works
After user registration, private key, public key, and account address are generated. Private key is stored encrypted by clients password locally, public key and account address are stored in the server.

When a client sends a message, a smart contract method is invoked to store its checksum. Afterward, the message is duplicated one copy is encrypted with the sender's public key and the second with the receivers. Both encryptions are stored in server DB in a single message object.

Messages are received by polling server DB and smart contract contents. When the client finds a message, it is decrypted and checked against the smart contract checksum. Only then it is shown to the client.

#### Dependencies:
  docker-compose <br>
  docker <br>
  truffle <br>
  python <br>

#### Setup:
  in file **docker-compose.yml** replace **--staging** with **--force-renew** <br>
    
    ./ssl_renew.sh

  
#### Starting server:
    docker-compose up
  
 #### Execution:
   https://slavka.one
