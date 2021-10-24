
trap  'echo signal received for orderer; kill $(jobs -p); wait' SIGINT SIGTERM
source $(dirname "$BASH_SOURCE")/common-params.sh

echo "start orderer"
export ORDERER_GENERAL_GENESISPROFILE=SampleDevModeSolo
export ORDERER_FILELEDGER_LOCATION=../../$TEST_ARTIFACTS_DIRECTORY/hyperledger/production/orderer
export ORDERER_CONSENSUS_WALDIR=../../$TEST_ARTIFACTS_DIRECTORY/hyperledger/production/orderer/etcdraft/wal
export ORDERER_CONSENSUS_SNAPDIR=../../$TEST_ARTIFACTS_DIRECTORY/hyperledger/production/orderer/etcdraft/snapshot
export ORDERER_GENERAL_BOOTSTRAPFILE=../../$TEST_ARTIFACTS_DIRECTORY/genesisblock

orderer &
wait