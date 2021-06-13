# End to end encrypted messaaging web app
using Ethereum blockchain for authentication and integrity checking. 

#### Dependencies:
  docker-compose <br>
  docker <br>
  geth <br>
  truffle <br>
  python <br>

#### Setup:
  in file **docker-compose.yml** replace **--staging** with **--force-renew** <br>
    
    ./ssl_renew.sh

  run geth local node:
    
    geth --rinkeby  --syncmode="light" --http.addr 192.168.1.11 --allow-insecure-unlock -keystore ~/.ethereum/keystore --cache=4096 --http --http.api eth,net,web3,personal --rpccorsdomain "https://slavka.one"


 
  
#### Starting server:
    docker-compose up
  
 #### Execution:
   https://slavka.one
