

echo "creating genesisblock"

source $(dirname "$BASH_SOURCE")/common-params.sh

configtxgen -profile SampleDevModeSolo -channelID syschannel -configPath $FABRIC_CFG_PATH -outputBlock $TEST_ARTIFACTS_DIRECTORY/genesisblock
