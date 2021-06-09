pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract MessageList {
    struct Message {
        string content;
        address senderAddr;
        uint256 time;
    }

    struct Client {
        bool initialized;
        uint256 messageCount;
        mapping(uint256 => Message) messages;
    }

    event MessageCreated(
        uint256 count,
        address sender,
        address reciever
    );

    mapping(address => Client) private clients;

    function createMessage(string memory _content, address reciever) public {
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
    }

    function getMessages(address reciever) public view returns (Message[] memory) {        
        Client storage recv = clients[reciever];    
        Message[] memory res = new Message[](recv.messageCount);

        if(msg.sender != reciever){
            return res;
        }

        for (uint256 i = 0; i<recv.messageCount; i++ ) {
            res[i] = recv.messages[i];
        }
        
        return res;
    }
}
