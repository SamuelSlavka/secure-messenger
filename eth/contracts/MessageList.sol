pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract MessageList {
    struct Message {
        string content;
        address senderAddr;
        uint time;
    }

    struct Client {
        bool initialized;
        uint messageCount;
        mapping(uint => Message) messages;
    }

    event MessageCreated(
        uint count,
        address sender,
        address reciever
    );

    mapping(address => Client) private clients;

    function createMessage(string memory _content, address reciever) public returns (uint) {
        Client storage recv = clients[reciever];

        if (!recv.initialized) {
            recv.initialized = true;
            recv.messageCount = 0;
        }

        recv.messages[recv.messageCount] = Message({
            content: _content,
            senderAddr: msg.sender,
            time: block.timestamp
        });
        recv.messageCount++;

        emit MessageCreated(recv.messageCount, msg.sender, reciever);
        return block.timestamp;
    }

    function getMessages(address reciever, address sender) public view returns (Message[] memory) {        
        Client storage recv = clients[reciever];  
        Client storage sndr = clients[sender];

        Message[] memory res = new Message[](recv.messageCount+sndr.messageCount);
        
        uint j = 0;
        for (uint i = 0; i<=recv.messageCount; i++ ) {
            if(sender == recv.messages[i].senderAddr){
                res[j] = recv.messages[i];
                j++;
            }
        }
        for (uint i = 0; i<=sndr.messageCount; i++ ) {
            if(reciever == sndr.messages[i].senderAddr){
                res[j] = sndr.messages[i];
                j++;
            }
        }        
        return res;
    }
}
