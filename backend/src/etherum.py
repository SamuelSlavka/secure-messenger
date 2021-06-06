from web3 import Web3
import json
from hexbytes import HexBytes

w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))

class HexJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, HexBytes):
            return obj.hex()
        return super().default(obj)

def get_last_transaction():
    try:
        transaction = w3.eth.get_transaction_by_block(w3.eth.blockNumber, 0)
        tx_dict = dict(transaction)
        tx_json = json.dumps(tx_dict, cls=HexJsonEncoder)
        return tx_json
    except:
        return {'error':'Error while fetching transaction'}