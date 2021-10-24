echo "approving chaincode" >&2
set -e
source $(dirname "$BASH_SOURCE")/common-params.sh
export FABRIC_LOGGING_SPEC=debug
export CORE_PEER_TLS_ENABLED=false

peer lifecycle chaincode approveformyorg  -o 127.0.0.1:7050 --channelID $CHANNEL_NAME --name $CORE_CHAINCODE_NAME --version 1.0 --sequence 1  --signature-policy "OR ('SampleOrg.member')" --package-id $CORE_CHAINCODE_ID
echo "approved chaincode" >&2

echo "checking commit readiness" >&2
peer lifecycle chaincode checkcommitreadiness -o 127.0.0.1:7050 --channelID $CHANNEL_NAME --name $CORE_CHAINCODE_NAME --version 1.0 --sequence 1   --signature-policy "OR ('SampleOrg.member')"

echo "committing" >&2
peer lifecycle chaincode commit -o 127.0.0.1:7050 --channelID $CHANNEL_NAME --name $CORE_CHAINCODE_NAME --version 1.0 --sequence 1  --signature-policy  "OR ('SampleOrg.member')" --peerAddresses 127.0.0.1:7051
echo "approved & committed" >&2