# 📘 Rango API — Documentação para Implementação do Frontend

## Visão Geral

**Rango** é um sistema de PDV (Ponto de Venda) para lanchonetes. A API REST é construída com **Quarkus** (Java) e exposta na base `/api`.

- **Base URL (dev):** `http://localhost:8081/api`
- **Autenticação:** Bearer Token (OAuth2 / Keycloak)
- **Content-Type:** `application/json`
- **OpenAPI UI (dev):** `http://localhost:8081/q/swagger-ui`

---

## 🔐 Autenticação

A API é protegida por **Keycloak (OIDC)**. Todas as rotas exigem um Bearer Token JWT válido.

### Obter token (dev)

```
POST http://localhost:8080/realms/master/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=rangoapi
username=<usuario>
password=<senha>
```

### Usar nas requisições

```
Authorization: Bearer <access_token>
```

> **Nota dev:** O realm de desenvolvimento está em `quarkus-realm-dev.json` na raiz do projeto.

---

## 📦 Módulos disponíveis

| Módulo     | Prefixo da Rota    | Descrição                              |
|------------|--------------------|----------------------------------------|
| Insumos    | `/api/insumos`     | Ingredientes / insumos do estoque      |
| Categorias | `/api/categorias`  | Categorias dos produtos do cardápio    |
| Produtos   | `/api/produtos`    | Cardápio da lanchonete                 |
| Pedidos    | `/api/pedidos`     | Pedidos / fluxo do PDV                 |

---

## 🧂 Insumos

Insumos são os ingredientes/matérias-primas utilizados na composição dos produtos.

### Tipos / Enums

#### `UnidadeMedida`
```
UNIDADE | GRAMA | QUILOGRAMA | LITRO | MILILITRO
```

---

### `POST /api/insumos` — Criar insumo

**Request Body:**
```json
{
  "descricao": "Carne 120g",
  "unidadeMedida": "UNIDADE",
  "custoUnitario": 3.50,
  "quantidadeEstoque": 100,
  "estoqueMinimo": 10
}
```

| Campo               | Tipo          | Obrigatório | Descrição                           |
|---------------------|---------------|-------------|-------------------------------------|
| `descricao`         | `string`      | ✅           | Nome/descrição do insumo            |
| `unidadeMedida`     | `UnidadeMedida` | ✅         | Enum de unidade                     |
| `custoUnitario`     | `number`      | ✅           | Custo por unidade                   |
| `quantidadeEstoque` | `number`      | ✅           | Quantidade atual em estoque         |
| `estoqueMinimo`     | `number`      | ✅           | Quantidade mínima de alerta         |

**Response — `201 Created`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### `GET /api/insumos` — Listar todos os insumos

**Query Params (opcionais):**

| Param  | Tipo  | Padrão | Descrição                        |
|--------|-------|--------|----------------------------------|
| `page` | `int` | `0`    | Número da página (base 0)        |
| `size` | `int` | `20`   | Itens por página (máx. 100)      |

**Exemplos:**
```
GET /api/insumos
GET /api/insumos?page=0&size=10
GET /api/insumos?page=1&size=20
```

**Response — `200 OK`:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "descricao": "Carne 120g",
      "unidadeMedida": "UNIDADE",
      "custoUnitario": 3.50,
      "quantidadeEstoque": 100,
      "estoqueMinimo": 10,
      "ativo": true
    }
  ],
  "totalItems": 42,
  "totalPages": 3,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### `GET /api/insumos/{id}` — Buscar insumo por ID

**Path Param:** `id` — UUID do insumo

**Response — `200 OK`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "descricao": "Carne 120g",
  "unidadeMedida": "UNIDADE",
  "custoUnitario": 3.50,
  "quantidadeEstoque": 100,
  "estoqueMinimo": 10,
  "ativo": true
}
```

---

### `PUT /api/insumos/{id}` — Atualizar insumo

**Path Param:** `id` — UUID do insumo

**Request Body:**
```json
{
  "descricao": "Carne 120g",
  "unidadeMedida": "UNIDADE",
  "custoUnitario": 3.75,
  "quantidadeEstoque": 90,
  "estoqueMinimo": 10,
  "ativo": true
}
```

| Campo               | Tipo            | Obrigatório | Descrição                  |
|---------------------|-----------------|-------------|----------------------------|
| `descricao`         | `string`        | ✅           | Nome/descrição              |
| `unidadeMedida`     | `UnidadeMedida` | ✅           | Enum de unidade             |
| `custoUnitario`     | `number`        | ✅           | Custo por unidade           |
| `quantidadeEstoque` | `number`        | ✅           | Quantidade em estoque       |
| `estoqueMinimo`     | `number`        | ✅           | Estoque mínimo de alerta    |
| `ativo`             | `boolean`       | ✅           | Ativa/desativa o insumo     |

**Response — `204 No Content`**

---

## 🏷️ Categorias

Categorias são cadastros independentes usados para classificar os produtos. Um produto pode ter **uma ou mais** categorias vinculadas.

---

### `POST /api/categorias` — Criar categoria

**Request Body:**
```json
{
  "nome": "Hambúrguer",
  "descricao": "Lanches e hambúrgueres artesanais"
}
```

| Campo       | Tipo     | Obrigatório | Descrição                   |
|-------------|----------|-------------|-----------------------------|
| `nome`      | `string` | ✅           | Nome único da categoria     |
| `descricao` | `string` | ❌           | Descrição opcional          |

**Response — `201 Created`:**
```json
{
  "id": "aab10001-e29b-41d4-a716-446655440000"
}
```

---

### `GET /api/categorias` — Listar todas as categorias

**Query Params (opcionais):**

| Param  | Tipo  | Padrão | Descrição                   |
|--------|-------|--------|-----------------------------|
| `page` | `int` | `0`    | Número da página (base 0)   |
| `size` | `int` | `20`   | Itens por página (máx. 100) |

**Response — `200 OK`:**
```json
{
  "items": [
    {
      "id": "aab10001-e29b-41d4-a716-446655440000",
      "nome": "Hambúrguer",
      "descricao": "Lanches e hambúrgueres artesanais",
      "ativa": true
    }
  ],
  "totalItems": 5,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### `GET /api/categorias/{id}` — Buscar categoria por ID

**Path Param:** `id` — UUID da categoria

**Response — `200 OK`:**
```json
{
  "id": "aab10001-e29b-41d4-a716-446655440000",
  "nome": "Hambúrguer",
  "descricao": "Lanches e hambúrgueres artesanais",
  "ativa": true
}
```

---

### `PUT /api/categorias/{id}` — Atualizar categoria

**Path Param:** `id` — UUID da categoria

**Request Body:**
```json
{
  "nome": "Hambúrguer Artesanal",
  "descricao": "Hambúrgueres feitos na hora",
  "ativa": true
}
```

| Campo       | Tipo      | Obrigatório | Descrição                        |
|-------------|-----------|-------------|----------------------------------|
| `nome`      | `string`  | ✅           | Nome da categoria                |
| `descricao` | `string`  | ❌           | Descrição opcional               |
| `ativa`     | `boolean` | ✅           | Ativa/desativa a categoria       |

**Response — `204 No Content`**

---

## 🍔 Produtos

Produtos representam os itens do cardápio. Cada produto deve ter **ao menos uma categoria** vinculada e pode ter uma receita (lista de insumos).

> ⚠️ O campo `categoria` (string livre) foi substituído por `categoriaIds` (lista de UUIDs). É necessário cadastrar as categorias antes de criar produtos.

---

### `POST /api/produtos` — Criar produto

**Request Body:**
```json
{
  "nome": "X-Burger",
  "descricao": "Hambúrguer artesanal com queijo",
  "categoriaIds": [
    "aab10001-e29b-41d4-a716-446655440000",
    "aab10002-e29b-41d4-a716-446655440000"
  ],
  "preco": 18.00,
  "receita": [
    {
      "insumoId": "550e8400-e29b-41d4-a716-446655440000",
      "quantidade": 1
    },
    {
      "insumoId": "660f9511-f3ac-52e5-b827-557766551111",
      "quantidade": 0.03
    }
  ]
}
```

| Campo          | Tipo            | Obrigatório | Descrição                            |
|----------------|-----------------|-------------|--------------------------------------|
| `nome`         | `string`        | ✅           | Nome do produto                      |
| `descricao`    | `string`        | ❌           | Descrição do produto                 |
| `categoriaIds` | `UUID[]`        | ✅           | Lista de IDs de categoria (mín. 1)   |
| `preco`        | `number`        | ✅           | Preço de venda                       |
| `receita`      | `ItemReceita[]` | ❌           | Lista de insumos da receita          |

**`ItemReceita`:**

| Campo        | Tipo     | Descrição                        |
|--------------|----------|----------------------------------|
| `insumoId`   | `UUID`   | ID do insumo                     |
| `quantidade` | `number` | Quantidade do insumo na receita  |

**Response — `201 Created`:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000"
}
```

---

### `GET /api/produtos` — Listar todos os produtos

**Query Params (opcionais):**

| Param  | Tipo  | Padrão | Descrição                        |
|--------|-------|--------|----------------------------------|
| `page` | `int` | `0`    | Número da página (base 0)        |
| `size` | `int` | `20`   | Itens por página (máx. 100)      |

**Exemplos:**
```
GET /api/produtos
GET /api/produtos?page=0&size=10
```

**Response — `200 OK`:**
```json
{
  "items": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "nome": "X-Burger",
      "descricao": "Hambúrguer artesanal com queijo",
      "categoriaIds": [
        "aab10001-e29b-41d4-a716-446655440000"
      ],
      "preco": 18.00,
      "ativo": true,
      "receita": [
        {
          "insumoId": "550e8400-e29b-41d4-a716-446655440000",
          "quantidade": 1
        }
      ]
    }
  ],
  "totalItems": 15,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### `GET /api/produtos/{id}` — Buscar produto por ID

**Path Param:** `id` — UUID do produto

**Response — `200 OK`:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "nome": "X-Burger",
  "descricao": "Hambúrguer artesanal com queijo",
  "categoriaIds": [
    "aab10001-e29b-41d4-a716-446655440000"
  ],
  "preco": 18.00,
  "ativo": true,
  "receita": [
    {
      "insumoId": "550e8400-e29b-41d4-a716-446655440000",
      "quantidade": 1
    }
  ]
}
```

---

### `PUT /api/produtos/{id}` — Atualizar produto

**Path Param:** `id` — UUID do produto

**Request Body:**
```json
{
  "nome": "X-Burger Duplo",
  "descricao": "Dois hambúrgueres com queijo",
  "categoriaIds": [
    "aab10001-e29b-41d4-a716-446655440000"
  ],
  "preco": 25.00,
  "ativo": true,
  "receita": [
    {
      "insumoId": "550e8400-e29b-41d4-a716-446655440000",
      "quantidade": 2
    }
  ]
}
```

| Campo          | Tipo            | Obrigatório | Descrição                          |
|----------------|-----------------|-------------|----------------------------------  |
| `nome`         | `string`        | ✅           | Nome do produto                    |
| `descricao`    | `string`        | ❌           | Descrição                          |
| `categoriaIds` | `UUID[]`        | ✅           | Lista de IDs de categoria (mín. 1) |
| `preco`        | `number`        | ✅           | Preço de venda                     |
| `ativo`        | `boolean`       | ✅           | Ativa/desativa o produto           |
| `receita`      | `ItemReceita[]` | ❌           | Receita atualizada                 |

**Response — `204 No Content`**

---

## 🛒 Pedidos

Pedido é o **Aggregate Root** do sistema. Toda operação do PDV passa por ele.

### Tipos / Enums

#### `TipoPedido`
```
MESA | BALCAO | RETIRADA | DELIVERY
```

#### `StatusPedido`
```
ABERTO → EM_PREPARO → PRONTO → ENTREGUE
                              ↓
                          CANCELADO (qualquer status exceto ENTREGUE)
```

#### `FormaPagamento`
```
DINHEIRO | CARTAO_DEBITO | CARTAO_CREDITO | PIX
```

---

### `POST /api/pedidos` — Criar pedido

Abre um novo pedido com os itens selecionados. O pedido começa com status `ABERTO`.

**Request Body:**
```json
{
  "tipo": "MESA",
  "itens": [
    {
      "produtoId": "770e8400-e29b-41d4-a716-446655440000",
      "nomeProduto": "X-Burger",
      "quantidade": 2,
      "precoUnitario": 18.00
    },
    {
      "produtoId": "880f9511-f3ac-52e5-b827-557766552222",
      "nomeProduto": "Coca-Cola",
      "quantidade": 1,
      "precoUnitario": 7.00
    }
  ]
}
```

| Campo          | Tipo          | Obrigatório | Descrição                                    |
|----------------|---------------|-------------|----------------------------------------------|
| `tipo`         | `TipoPedido`  | ✅           | Tipo do atendimento                          |
| `itens`        | `ItemInput[]` | ✅           | Lista de itens (mínimo 1)                    |

**`ItemInput`:**

| Campo           | Tipo     | Obrigatório | Descrição                    |
|-----------------|----------|-------------|------------------------------|
| `produtoId`     | `UUID`   | ✅           | ID do produto                |
| `nomeProduto`   | `string` | ✅           | Nome (snapshot do cardápio)  |
| `quantidade`    | `int`    | ✅           | Quantidade                   |
| `precoUnitario` | `number` | ✅           | Preço unitário no momento    |

**Response — `201 Created`:**
```json
{
  "id": "990a1234-e29b-41d4-a716-446655440000"
}
```

---

### `GET /api/pedidos` — Listar todos os pedidos

Lista todos os pedidos independente do status, com paginação.

**Query Params (opcionais):**

| Param  | Tipo  | Padrão | Descrição                        |
|--------|-------|--------|----------------------------------|
| `page` | `int` | `0`    | Número da página (base 0)        |
| `size` | `int` | `20`   | Itens por página (máx. 100)      |

**Exemplos:**
```
GET /api/pedidos
GET /api/pedidos?page=0&size=10
```

**Response — `200 OK`:**
```json
{
  "items": [
    {
      "id": "990a1234-e29b-41d4-a716-446655440000",
      "numero": 102,
      "tipo": "MESA",
      "status": "ABERTO",
      "total": 43.00,
      "itens": [
        {
          "produtoId": "770e8400-e29b-41d4-a716-446655440000",
          "nomeProduto": "X-Burger",
          "quantidade": 2,
          "precoUnitario": 18.00,
          "subtotal": 36.00
        },
        {
          "produtoId": "880f9511-f3ac-52e5-b827-557766552222",
          "nomeProduto": "Coca-Cola",
          "quantidade": 1,
          "precoUnitario": 7.00,
          "subtotal": 7.00
        }
      ],
      "pagamentos": []
    }
  ],
  "totalItems": 30,
  "totalPages": 2,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### `GET /api/pedidos/status` — Listar pedidos por status

Filtra pedidos por um `StatusPedido` específico, com paginação.

**Query Params:**

| Param    | Tipo           | Obrigatório | Descrição                        |
|----------|----------------|-------------|----------------------------------|
| `status` | `StatusPedido` | ✅           | Status a filtrar                 |
| `page`   | `int`          | ❌ (padrão `0`)  | Número da página (base 0)    |
| `size`   | `int`          | ❌ (padrão `20`) | Itens por página (máx. 100)  |

**Exemplos:**
```
GET /api/pedidos/status?status=ABERTO
GET /api/pedidos/status?status=EM_PREPARO
GET /api/pedidos/status?status=PRONTO&page=0&size=10
```

**Response — `200 OK`:**
```json
{
  "items": [
    {
      "id": "990a1234-e29b-41d4-a716-446655440000",
      "numero": 102,
      "tipo": "MESA",
      "status": "ABERTO",
      "total": 43.00,
      "itens": [
        {
          "produtoId": "770e8400-e29b-41d4-a716-446655440000",
          "nomeProduto": "X-Burger",
          "quantidade": 2,
          "precoUnitario": 18.00,
          "subtotal": 36.00
        }
      ],
      "pagamentos": []
    }
  ],
  "totalItems": 5,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### `GET /api/pedidos/{id}` — Buscar pedido por ID

**Path Param:** `id` — UUID do pedido

**Response — `200 OK`:**
```json
{
  "id": "990a1234-e29b-41d4-a716-446655440000",
  "numero": 102,
  "tipo": "MESA",
  "status": "ABERTO",
  "total": 43.00,
  "itens": [
    {
      "produtoId": "770e8400-e29b-41d4-a716-446655440000",
      "nomeProduto": "X-Burger",
      "quantidade": 2,
      "precoUnitario": 18.00,
      "subtotal": 36.00
    }
  ],
  "pagamentos": [
    {
      "forma": "PIX",
      "valor": 20.00
    }
  ]
}
```

---

### `POST /api/pedidos/{id}/pagamentos` — Adicionar pagamento

Adiciona um pagamento ao pedido. Suporta **pagamento parcial / misto**.

> ⚠️ O total de pagamentos **não pode ultrapassar** o valor total do pedido.

**Path Param:** `id` — UUID do pedido

**Request Body:**
```json
{
  "forma": "PIX",
  "valor": 43.00
}
```

| Campo   | Tipo             | Obrigatório | Descrição              |
|---------|------------------|-------------|------------------------|
| `forma` | `FormaPagamento` | ✅           | Forma de pagamento     |
| `valor` | `number`         | ✅           | Valor a ser pago       |

**Response — `204 No Content`**

**Exemplo de pagamento misto (2 chamadas):**
```
POST /api/pedidos/{id}/pagamentos
{ "forma": "CARTAO_CREDITO", "valor": 30.00 }

POST /api/pedidos/{id}/pagamentos
{ "forma": "DINHEIRO", "valor": 13.00 }
```

---

### `PATCH /api/pedidos/{id}/avancar-status` — Avançar status do pedido

Avança o pedido para o próximo status na fila.

| De           | Para        |
|--------------|-------------|
| `ABERTO`     | `EM_PREPARO`|
| `EM_PREPARO` | `PRONTO`    |
| `PRONTO`     | `ENTREGUE`  |

> ⚠️ Pedido `ENTREGUE` ou `CANCELADO` não pode ser avançado.

**Path Param:** `id` — UUID do pedido

**Body:** *(vazio)*

**Response — `204 No Content`**

---

### `PATCH /api/pedidos/{id}/cancelar` — Cancelar pedido

Cancela um pedido que ainda não foi entregue.

> ⚠️ Pedido `ENTREGUE` **não pode** ser cancelado.

**Path Param:** `id` — UUID do pedido

**Body:** *(vazio)*

**Response — `204 No Content`**

---

## ❌ Tratamento de Erros

A API retorna erros de domínio como `DomainException`. O frontend deve tratar os seguintes status:

| Status HTTP | Situação                                          |
|-------------|---------------------------------------------------|
| `400`       | Dados inválidos / violação de regra de negócio    |
| `401`       | Token ausente ou expirado                         |
| `403`       | Token sem permissão                               |
| `404`       | Recurso não encontrado                            |
| `500`       | Erro interno do servidor                          |

**Exemplo de resposta de erro (400):**
```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Total de pagamentos não pode exceder o total do pedido"
}
```

---

## 🗺️ Fluxos do PDV — Guia de Implementação

### Fluxo 1: Cadastro do Cardápio (Admin)

```
1. Criar categorias  →  POST /api/categorias
2. Criar insumos     →  POST /api/insumos
3. Criar produtos    →  POST /api/produtos (com categoriaIds referenciando IDs das categorias)
4. Editar produto    →  PUT  /api/produtos/{id}
```

### Fluxo 2: Abertura de Pedido (Caixa/Atendente)

```
1. Listar produtos disponíveis  →  GET /api/produtos
   (filtre por ativo === true no frontend)

2. Montar o carrinho localmente no frontend

3. Criar pedido  →  POST /api/pedidos
   (envie os itens com produtoId, nomeProduto, quantidade, precoUnitario)

4. Guardar o ID do pedido retornado
```

### Fluxo 3: Pagamento (Caixa)

```
1. Consultar pedido  →  GET /api/pedidos/{id}
2. Exibir total e itens
3. Adicionar pagamento(s)  →  POST /api/pedidos/{id}/pagamentos
   (pode chamar múltiplas vezes para pagamento misto)
```

### Fluxo 4: Tela da Cozinha (KDS)

```
1. Listar pedidos abertos/em preparo  →  GET /api/pedidos/status?status=ABERTO
                                         GET /api/pedidos/status?status=EM_PREPARO

2. Avançar status quando começar/terminar  →  PATCH /api/pedidos/{id}/avancar-status

3. Polling recomendado: atualizar a cada 10-15 segundos
```

### Fluxo 5: Cancelamento

```
PATCH /api/pedidos/{id}/cancelar
(disponível para qualquer status exceto ENTREGUE)
```

---

## 📊 Modelo de Dados — Resumo dos Responses

### `PageResult<T>` (resposta de listagem paginada)
```typescript
interface PageResult<T> {
  items: T[];           // Lista de itens da página atual
  totalItems: number;   // Total de registros no banco
  totalPages: number;   // Total de páginas
  currentPage: number;  // Página atual (base 0)
  pageSize: number;     // Tamanho da página solicitado
}
```

### `InsumoOutput`
```typescript
interface InsumoOutput {
  id: string;               // UUID
  descricao: string;
  unidadeMedida: 'UNIDADE' | 'GRAMA' | 'QUILOGRAMA' | 'LITRO' | 'MILILITRO';
  custoUnitario: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}
```

### `CategoriaOutput`
```typescript
interface CategoriaOutput {
  id: string;       // UUID
  nome: string;
  descricao: string | null;
  ativa: boolean;
}
```

### `ProdutoOutput`
```typescript
interface ProdutoOutput {
  id: string;               // UUID
  nome: string;
  descricao: string | null;
  categoriaIds: string[];   // Lista de UUIDs das categorias vinculadas
  preco: number;
  ativo: boolean;
  receita: {
    insumoId: string;       // UUID
    quantidade: number;
  }[];
}
```

### `PedidoOutput`
```typescript
interface PedidoOutput {
  id: string;               // UUID
  numero: number;           // Número sequencial do pedido
  tipo: 'MESA' | 'BALCAO' | 'RETIRADA' | 'DELIVERY';
  status: 'ABERTO' | 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
  total: number;
  itens: {
    produtoId: string;      // UUID
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }[];
  pagamentos: {
    forma: 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX';
    valor: number;
  }[];
}
```

### `IdResponse` (retorno de criação)
```typescript
interface IdResponse {
  id: string;               // UUID do recurso criado
}
```

---

## 🔢 Regras de Negócio Importantes para o Frontend

### Paginação
- Todos os endpoints de listagem retornam um `PageResult<T>` com os campos `items`, `totalItems`, `totalPages`, `currentPage` e `pageSize`
- O parâmetro `page` é **base 0** (primeira página = `0`)
- O tamanho padrão é **20 itens por página**, máximo de **100**
- Para navegar, incremente `page` até `page === totalPages - 1`

### Pedidos
- Um pedido começa sempre com status `ABERTO`
- O `numero` do pedido é gerado automaticamente pelo backend (sequencial)
- `total` = soma de `(quantidade × precoUnitario)` de todos os itens
- Só é possível adicionar pagamentos se o pedido **não estiver cancelado ou entregue**
- A soma dos pagamentos **não pode ultrapassar o total** do pedido
- Pagamento misto é permitido (múltiplas chamadas para `/pagamentos`)

### Produtos
- Ao criar um pedido, envie o `nomeProduto` e `precoUnitario` atual — esses valores ficam **imutáveis** no pedido (snapshot)
- Exibir somente produtos com `ativo === true` no PDV
- Um produto deve ter **ao menos uma categoria** vinculada
- O frontend deve buscar as categorias disponíveis em `GET /api/categorias` antes de exibir o formulário de criação/edição de produto

### Categorias
- Uma categoria desativada (`ativa === false`) pode continuar vinculada a produtos existentes
- O `nome` da categoria é **único** no sistema — o backend retornará erro se tentar cadastrar um nome duplicado

### Insumos
- Exibir somente insumos com `ativo === true` na tela de cadastro de produto (receita)

---

## 🌐 Configuração do Ambiente

| Variável        | Valor dev                                   |
|-----------------|---------------------------------------------|
| API Base URL    | `http://localhost:8081/api`                 |
| Keycloak URL    | `http://localhost:8080`                     |
| Keycloak Realm  | `master`                                    |
| Client ID       | `rangoapi`                                  |
| Client Secret   | `fDc0uMEsYK4WKJH9CZeweNjMAiBXDh5n`         |
| Banco de Dados  | PostgreSQL `localhost:5432/rangodb`         |
| Swagger UI      | `http://localhost:8081/q/swagger-ui`        |

### Subir ambiente completo (Docker)

```bash
docker-compose up -d
```

---

## 📋 Resumo de Todas as Rotas

| Método   | Rota                                | Descrição                           |
|----------|-------------------------------------|-------------------------------------|
| `POST`   | `/api/insumos`                      | Criar insumo                        |
| `GET`    | `/api/insumos`                      | Listar insumos (paginado)           |
| `GET`    | `/api/insumos/{id}`                 | Buscar insumo por ID                |
| `PUT`    | `/api/insumos/{id}`                 | Atualizar insumo                    |
| `POST`   | `/api/categorias`                   | Criar categoria                     |
| `GET`    | `/api/categorias`                   | Listar categorias (paginado)        |
| `GET`    | `/api/categorias/{id}`              | Buscar categoria por ID             |
| `PUT`    | `/api/categorias/{id}`              | Atualizar categoria                 |
| `POST`   | `/api/produtos`                     | Criar produto                       |
| `GET`    | `/api/produtos`                     | Listar produtos (paginado)          |
| `GET`    | `/api/produtos/{id}`                | Buscar produto por ID               |
| `PUT`    | `/api/produtos/{id}`                | Atualizar produto                   |
| `POST`   | `/api/pedidos`                      | Criar pedido                        |
| `GET`    | `/api/pedidos`                      | Listar todos os pedidos (paginado)  |
| `GET`    | `/api/pedidos/status?status=...`    | Listar pedidos por status (paginado)|
| `GET`    | `/api/pedidos/{id}`                 | Buscar pedido por ID                |
| `POST`   | `/api/pedidos/{id}/pagamentos`      | Adicionar pagamento                 |
| `PATCH`  | `/api/pedidos/{id}/avancar-status`  | Avançar status do pedido            |
| `PATCH`  | `/api/pedidos/{id}/cancelar`        | Cancelar pedido                     |

