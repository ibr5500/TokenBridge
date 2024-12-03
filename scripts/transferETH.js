const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const accounts = await ethers.getSigners();

  if (accounts.length < 2) {
    console.error('Error: Not enough accounts available.');
    process.exit(1);
  }

  const sender = accounts[0];
  const receiver = accounts[1];

  console.log('Sending from account:', sender.address);
  console.log('Receiving to account:', receiver.address);

  const amount = ethers.parseEther('0.01');

  const tx = await sender.sendTransaction({
    to: receiver.address,
    value: amount,
  });

  await tx.wait();
  console.log('Transaction successful! Hash:', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
