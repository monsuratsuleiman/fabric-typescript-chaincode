echo "creating channel"

source $(dirname "$BASH_SOURCE")/common-params.sh
export CORE_PEER_TLS_ENABLED=false

configtxgen -channelID $CHANNEL_NAME -outputCreateChannelTx $TEST_ARTIFACTS_DIRECTORY/$CHANNEL_NAME.tx -profile SampleSingleMSPChannel -configPath $FABRIC_CFG_PATH
peer channel create -o 127.0.0.1:7050 -c $CHANNEL_NAME -f $TEST_ARTIFACTS_DIRECTORY/$CHANNEL_NAME.tx --outputBlock  $TEST_ARTIFACTS_DIRECTORY/$CHANNEL_NAME.block

echo  "join channel"
peer channel join -b $TEST_ARTIFACTS_DIRECTORY/$CHANNEL_NAME.block
echo "joined channel"