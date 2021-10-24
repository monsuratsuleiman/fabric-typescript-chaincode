echo "starting fabric peer"

trap  'echo signal received peer; kill $(jobs -p); wait' SIGINT SIGTERM
source $(dirname "$BASH_SOURCE")/common-params.sh

export FABRIC_LOGGING_SPEC=chaincode=debug
export CORE_PEER_TLS_ENABLED=false
export CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
export CORE_OPERATIONS_LISTENADDRESS=127.0.0.1:9445
# PATH relative to sample config
export CORE_PEER_FILESYSTEMPATH=../../$TEST_ARTIFACTS_DIRECTORY/hyperledger/production
peer node start --peer-chaincodedev &
wait
