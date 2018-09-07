const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Blockchain = require('./simpleChain').Blockchain;
const Block = require('./simpleChain').Block;
const dbInterface = require('./dbInterface')

const version = require('./package.json').version;

let blockChain = new Blockchain();

app.get('/', (req, res) => {
  res.json({'success': true, version: version})
});

app.get('/block/:blockHeight', function(req, res) {
  let blockHeight = -1;
  if (req.params.blockHeight === undefined) {
    res.status(400).json({'success': false, 'error': 'Please include block ID in URL'});
    return;
  }
  try {
    blockHeight = parseInt(req.params.blockHeight);
    if (isNaN(blockHeight)) {
      throw "Block ID is invalid";
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({'success': false, 'error': 'Block ID is invalid'})
    return;
  }

  dbInterface.getBlock(blockHeight)
  .then((block) => {
    res.json(block)
    return;
  })
  .catch((err) => {
    res.status(500).json({"success": false, "error": err.toString()});
    return;
  })
})

app.post('/block/', function (req, res) {
  let blockData = req.body.data;
  if (blockData === undefined) {
    blockData = "";
  }

  blockChain.addBlock(new Block(blockData))
  .then((newBlock) => {
    console.log(newBlock)
    res.json(newBlock);
    return; 
  }).catch((err) => {
    res.status(500).json({"success": false, "error": "Error while adding your block to the chain"});
    return;
  })
});

app.listen(8000, () => console.log('Blockchain web service running on port 8000'))
