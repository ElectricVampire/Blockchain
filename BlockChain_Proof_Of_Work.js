const GetSHA256Hash = require("crypto-js/sha256");

// Block is consist of following inputs:
// Index or Vesrion - 4 Bytes
// timeStamp - 4Bytes
// hash of current block after including multiple transaction data - 32 Bytes
// preBlockHash - Block of previous block in given block chain - 32 Bytes
// Nonce, Pre-determined substring of hash will be produced if concatinated with block data - 4 Bytes - Will be explained in Proof of Work
// Difficulty, Pre-determined substring of hash for a given block - 4 Bytes - Will be explained in Proof of Work 
class Block {
    constructor(index, timeStamp, data, preBlockHash = '') {
        this.index = index;
        this.preBlockHash = preBlockHash;
        this.data = data;
        this.nonce = 0;
        this.hash = this.generateHash();
    }

    generateHash() {
        return GetSHA256Hash(this.index + this.preBlockHash + this.timeStamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // So difficulty is number of zeros in a given hash function 
    // problem or work which we are doing here is that after adding what nonce value in our block data, we get that hash data preceded"difficulty" number of zero
    mineBlock(difficulty) {

        // See 
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.hash = this.generateHash();
            this.nonce++;
        }

        console.log("Block Mined: " + this.hash +"   Nonce: "+ this.nonce);
    }
}

// Chain of block, where each block is linked with previous block. Each block contains the hash of previous block .
class BlockChain {
    constructor(difficulty) {

        // When even a new crypto currency is generated the first block is processed manually as it don't have link to previous block
        // and this block is known as genesis block
        // So the first block of our chain is hardcoded
        this.chain = [new Block(0, "01/01/2018", "Block 0", "0")]
        this.difficulty = difficulty;
    }

    // Returns the latest block of given chain
    getTopBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add a block in chain
    addBlock(block) {

        // Before adding the block to chain should updated the previous block hash in block object       
        block.preBlockHash = this.getTopBlock().hash;
        block.hash = block.generateHash();

        // Lets mine the Block with given difficulty
        block.mineBlock(this.difficulty);
        this.chain.push(block);
    }

    // It make sure that no one has tampered with block chain.
    isChainValid() {
        // We start from 1 as we know for certain that first block to chain is genesis which don't have any link to previous blocks
        for (let blockIndex = 1; blockIndex < this.chain.length; blockIndex++) {
            const currentBlock = this.chain[blockIndex];
            const preBlock = this.chain[blockIndex - 1];

            // Make sure that data of current hash is not tampered
            if (currentBlock.hash !== currentBlock.generateHash()) {
                return false;
            }

            // validate link to previous block
            if (currentBlock.preBlockHash !== preBlock.hash) {
                return false;
            }
        }

        // If block pass above checks return true
        return true;
    }
}

// Create dummy chain object with difficulty 2
// Increasing the diffculty will incrase the mining time
let dummyChain = new BlockChain(2);

// Add some blocks
dummyChain.addBlock(new Block(1, "01/01/2018", { amount: 1 }));
dummyChain.addBlock(new Block(2, "01/01/2018", { amount: 2 }));

function PrintChain() {
    console.log(JSON.stringify(dummyChain, null, 5));
}

// Print the chain
// PrintChain();

// See if someone has modified any block in chain?
// console.log('Valid Block Chain? ' + dummyChain.isChainValid());

// Modify some data of public ledger
// dummyChain.chain[1].data = { amount: 50 };

// let's recompute the hash too
// Won't work...Why? Because relation will previous block will invalidate the chain
// dummyChain.chain[1].hash = dummyChain.chain[1].generateHash()

// How can i do it?
// Recalculate the hash of all blocks
// In our case we have only two blocks and we modified block with index 1...
// hence i just need to assign block2.PreviousBlockHash with new hash and recompute the hash of block2

// Aa-ha smart...Won't work either ...Because of Proof of Work
// dummyChain.chain[2].preBlockHash = dummyChain.chain[1].generateHash();
// dummyChain.chain[2].hash = dummyChain.chain[2].generateHash();

// Print the chain
// PrintChain();

// See if someone has modified any block in chain?
// console.log('Valid Block Chain? ' + dummyChain.isChainValid());
