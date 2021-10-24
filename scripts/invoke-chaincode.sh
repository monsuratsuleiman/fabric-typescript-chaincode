echo "invoking chaincode"
set -e
source $(dirname "$BASH_SOURCE")/common-params.sh
export FABRIC_LOGGING_SPEC=debug
export CORE_PEER_TLS_ENABLED=false

export CORE_PEER_ADDRESS=127.0.0.1:7051
echo "instantiatedddddddd"
peer chaincode invoke -o 127.0.0.1:7050 -C $CHANNEL_NAME -n $CORE_CHAINCODE_NAME -c '{"Args":["com.contracts.FirstContract:initLedger"]}'
#sleep 20s

echo "instantiatedddddddd2"
peer chaincode invoke -o 127.0.0.1:7050 -C $CHANNEL_NAME -n $CORE_CHAINCODE_NAME -c '{"Args":["com.contracts.FirstContract:readFirst", "123"]}'
sleep 10s
#echo "success chaincode"