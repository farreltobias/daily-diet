# Requisitos funcionais

## User (Usuário)
- [ ] Deve ser possível criar um usuário
  - Criar usuário com um sessionId (adicionar nos cookies)

## Meal (Refeição)
- [ ] Deve ser possível registrar uma refeição feita, com as seguintes informações:
  - Nome
  - Descrição
  - Data e Hora
  - Está dentro ou não da dieta
- [ ] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- [ ] Deve ser possível apagar uma refeição
- [ ] Deve ser possível listar todas as refeições de um usuário
- [ ] Deve ser possível visualizar uma única refeição

## Metrics (Métricas)
- [ ] Deve ser possível recuperar as métricas de um usuário
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta

# Regras de negócio

## User (Usuário)
- [ ] Deve ser possível identificar o usuário entre as requisições
  - Pela sessionId

## Meal (Refeição)
- [ ] As refeições cadastradas devem ser relacionadas ao usuário que cadastrou
  - Pela sessionId e pelo id do usuário
- [ ] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou