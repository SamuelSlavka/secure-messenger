# End to end encrypted messaging web app

using Ethereum smart contract for authentication and integrity checking. 

## How it works
After user registration, private key, public key, and account address are generated. When a client sends a message, smart contract method is invoked to store its checksum. Afterward, the message is duplicated one copy is encrypted with the senders public key and the second with the receivers. Both encryptions are stored in server DB in single message object.

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
