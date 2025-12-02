# User API Spec

## Register User API

Endpoint : POST/api/users

Request Body :

```json
{
  "username": "mesah",
  "password": "barus123",
  "name": "mesahbarus"
}
```

Response Body Success :

```json
{
  "data": {
    "username": "mesah",
    "name": "Mesah Barus"
  }
}
```

Response Body Error :

```json
{
  "errors": "Username already registered"
}
```

## Login User API

Endpoint : POST/api/users/login

Reseponse Body :

```json
{
  "username": "mesah",
  "password": "barus123"
}
```

Response Body Success :

```json
{
  "data": {
    "token": "unique-token"
  }
}
```

Response Body Failed :

```json
{
  "errors": "username or password is wrong"
}
```

## Update User API

Endpoint : PATCH/api/users/current

Headers :

- Authorization: token

Request Body:

```json
{
  "name": "Mesah Barus",
  "password": "New password " // Optional
}
```

Response Body Success:

```json
{
  "data": {
    "username": "mesah",
    "name": "mesah barus"
  }
}
```

Response Body Error :

```json
{
  "errors": "Name length max 100"
}
```

## Get User API

Endpoints : POST/api/users/current

Headers :

- Authorization: token

Response Body

```json
{
  "username": "mesah",
  "name": "mesah barus"
}
```

Response Body Error

```json
{ "errors": "Unauthorized" }
```

## Logout User API

Endpoint : DELETE/api/users/logout

Headers :

- Authorization: token

Response Body Success

```json
{
  "data": "Ok"
}
```

Response Body Error

```json
{
  "errors": "Anauthorized"
}
```
