require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./db');
const { formatBytes32String } = require('ethers/lib/utils');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const Transaction = mongoose.model(
  'Transaction',
  new mongoose.Schema({
    sender: String,
    receiver: String,
    amount: String,
    txHash: String,
    timestamp: { type: Date, default: Date.now },
  }),
);

connectDB();

const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, require('./abi.json'), wallet);

app.post('/api/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const tx = await contract.transfer(to, ethers.utils.parseUnits(amount, 18));
    await tx.wait();

    const transaction = new Transaction({
      sender: from,
      receiver: to,
      amount,
      txHash: tx.hash,
    });
    await transaction.save();

    res.json({ message: 'Transfer successful', transactionHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
