# End to end encrypted messaaging web app

using Ethereum smart contract for authentication and integrity checking. 

## How it works
After user registration, the private key, public key, and account address are generated. When a client sends a message, a smart contract method is invoked to store its checksum. Afterward, the message is encrypted one copy with the sender's public key and the second with the receiver's. Both encryptions are stored in server DB.

After the client receives a message, it is decrypted and checked against the smart contract checksum. Only then it is shown to the client.

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
