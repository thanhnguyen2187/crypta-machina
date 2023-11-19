curl \
    -H "Authorization: Basic YWRtaW46YWRtaW4=" \
    -X GET \
    127.0.0.1:21870/api/v1/alive \
    | jq \
;

curl \
    -H "Authorization: Basic YWRtaW46YWRtaW4=" \
    -X GET \
    127.0.0.1:21870/api/v1/snippets \
    | jq \
;

curl \
    -X PUT \
    --header 'Content-Type: application/json' \
    --data '{ "id": "abcd" }' \
    127.0.0.1:21870/api/v1/snippet \
    | jq \
;

curl \
    127.0.0.1:21870/api/v1/snippet/abcd \
;

