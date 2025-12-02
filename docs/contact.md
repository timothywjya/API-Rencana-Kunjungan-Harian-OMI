# Contact API Spec

## Create Contact API

Endpoint : POST/api/contacts

Headers :

- Authorization: token

Request Body :

```json
{
  "firstname": "mesah",
  "lastname": "barus",
  "email": "mesahbarus@gmail.com",
  "phone": "085225837721"
}
```

Response Body Success :

```json
{
  "data": {
    "firstname": "mesah",
    "lastname": "barus",
    "email": "mesahbarus@gmail.com",
    "phone": "085225837721"
  }
}
```

Response Body Error :

```json
{
  "erros": "Username already used by others contact"
}
```

## Update Contact API

Endpoint : PUT/api/contacts/:id

Headers :

- Authorization: token

Request Body :

```json
{
  "firstname": "mesah",
  "lastname": "barus",
  "email": "mesahbarus@gmail.com",
  "phone": "085225837721"
}
```

Response Body Success :

```json
{
  "data": {
    "firstname": "mesah",
    "lastname": "barus",
    "email": "mesahbarus@gmail.com",
    "phone": "085225837721"
  }
}
```

Response Body Error :

```json
{
  "errors": "Emails is not valid format"
}
```

## Get Contact API

Endpoint : GET/api/contacts/:id

Headers :

- Authorization: token

Response Body Success :

```json
{
  "data": {
    "id": 1,
    "firstname": "mesah",
    "lastname": "barus",
    "email": "mesahbarus@gmail.com",
    "phone": "085225837721"
  }
}
```

Response Body Error :

```json
{
  "erros": "Contact not found"
}
```

## Search Contact API

Endpoint : GET/api/contacts

Headers :

- Authorization: token

Query Params :

- name : Search by first_name or last_name, using like, optional
- email : Search by email, using like, optional
- phone : Search by phone, using like, optional
- page : number of page, default 1
- size : size per page, default 10

Response Body Success :

```json
{
  "data": [
    {
      "id": 1,
      "firstname": "mesah",
      "lastname": "barus",
      "email": "mesahbarus@gmail.com",
      "phone": "085225837721"
    },
    {
      "id": 2,
      "firstname": "mesah",
      "lastname": "barus",
      "email": "mesahbarus@gmail.com",
      "phone": "085225837721"
    },
    {
      "id": 3,
      "firstname": "mesah",
      "lastname": "barus",
      "email": "mesahbarus@gmail.com",
      "phone": "085225837721"
    },
    {
      "id": 4,
      "firstname": "mesah",
      "lastname": "barus",
      "email": "mesahbarus@gmail.com",
      "phone": "085225837721"
    }
  ],
  "paging": {
    "page": 1,
    "total_page": 3,
    "total_item": 30
  }
}
```

Response Body Error :

## Remove Contact API

Endpoint : DELETE/api/contacs/:id

Headers :

- Authorization: token

Response Body Success :

```json
{
  "data": "Ok"
}
```

Response Body Error :

```json
{
  "errors": "Contact not found"
}
```
