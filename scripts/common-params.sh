
export PATH=/Users/monsuratsuleiman/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=$(dirname "$BASH_SOURCE")/sampleconfig

CURRENT_SCRIPT_DIRECTORY=$(dirname "$BASH_SOURCE")
TEST_ARTIFACTS_DIRECTORY=${CURRENT_SCRIPT_DIRECTORY}/../chain-artifacts

CHANNEL_NAME="test-channel"
CORE_CHAINCODE_NAME=sample-chain-code
CORE_CHAINCODE_ID="$CORE_CHAINCODE_NAME:1.0"
