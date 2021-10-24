
trap  'echo signal received for chaincode; kill $(jobs -p); wait' SIGINT SIGTERM
echo "installing chain code"
source $(dirname "$BASH_SOURCE")/common-params.sh

export CORE_PEER_TLS_ENABLED=false

SCRIPT_DIRECTORY=$(dirname "$BASH_SOURCE")

cp $SCRIPT_DIRECTORY/../package.json $SCRIPT_DIRECTORY/../dist/package.json
cd $SCRIPT_DIRECTORY/../dist

../node_modules/.bin/fabric-chaincode-node start --peer.address 127.0.0.1:7052 --chaincode-id-name $CORE_CHAINCODE_ID &

wait
