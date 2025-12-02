# Address API Spec

## Create Address API

Endpoint : POST /api/address/:contactid/addresses

Headers :

- Authirzation: token

Request Body :

```json
{
  "street": "Jalan",
  "city": "Kota",
  "province": "SUMUT",
  "country": "Indonesia",
  "postal_code": "1234"
}
```

Response Body Success :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan",
    "city": "Kota",
    "province": "SUMUT",
    "country": "Indonesia",
    "postal_code": "1234"
  }
}
```

Response Body Error :

```json
{ "errors": "Country is required" }
```

## Update Address API

Endpoint : PUT /api/address/:contactid/addresses/:addressid

Headers :

- Authirzation: token

Request Body :

```json
{
  "street": "Jalan",
  "city": "Kota",
  "province": "SUMUT",
  "country": "Indonesia",
  "postal_code": "1234"
}
```

Response Body Success :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan",
    "city": "Kota",
    "province": "SUMUT",
    "country": "Indonesia",
    "postal_code": "1234"
  }
}
```

Response Body Error :

```json
{ "erros": "Failed to updat edata" }
```

## Get Address API

Endpoint : GET /api/address/:contactid/addresses

Headers :

- Authirzation: token

Response Body Success :

```json
{
  "data": {
    "id": 1,
    "street": "Jalan",
    "city": "Kota",
    "province": "SUMUT",
    "country": "Indonesia",
    "postal_code": "1234"
  }
}
```

Response Body Error :

```json
{ "errors": "Data not found" }
```

## List Address API

Endpoint : GET /api/address/:id/addresses

Headers :

- Authirzation: token

Response Body Success :

```json
{
  "data": [
    {
      "data": {
        "id": 1,
        "street": "Jalan",
        "city": "Kota",
        "province": "SUMUT",
        "country": "Indonesia",
        "postal_code": "1234"
      }
    }
  ]
}
```

Response Body Error :

```json
{ "errors": "Data not found" }
```

## Remove Address API

Endpoint : DELETE /api/address/:contactid/addresses/:addressId

Headers :

- Authirzation: token

Response Body Success :

```json
{
  "data": "Ok"
}
```

Response Body Error :

```json
{ "errors": "Data not found" }
```
