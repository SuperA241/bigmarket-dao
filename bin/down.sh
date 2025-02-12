#!/bin/bash

docker rm -f stacks-explorer.bigmarket-dao.devnet
docker rm -f bitcoin-explorer.bigmarket-dao.devnet
docker rm -f stacks-node.bigmarket-dao.devnet
sleep 2
docker rm -f stacks-signer-2.bigmarket-dao.devnet
docker rm -f stacks-signer-1.bigmarket-dao.devnet
sleep 2
docker rm -f stacks-api.bigmarket-dao.devnet
docker rm -f postgres.bigmarket-dao.devnet
docker rm -f bitcoin-node.bigmarket-dao.devnet
sleep 2

docker network rm bigmarket-dao.devnet

echo "removed clarinet devnet conntainers and network."