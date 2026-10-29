# TaskFlow - CRUD com deploy automático em VM

Aplicação acadêmica para cadastro e acompanhamento de tarefas. O sistema implementa as operações **Create, Read, Update e Delete (CRUD)** e foi preparado para execução em uma máquina virtual por Docker Compose, com atualização automática usando um runner self-hosted do GitHub Actions.

Repositório oficial: <https://github.com/Kenjihidehira/devops-atividade>

## Integrantes

- Wesley Kenji Ito Hidehira - RA 250257

## Tecnologias utilizadas

- Node.js 22, utilizando apenas módulos nativos
- API HTTP no padrão REST
- HTML, CSS e JavaScript no frontend
- Persistência em arquivo JSON com volume Docker
- Docker e Docker Compose
- GitHub Actions com runner self-hosted

## Funcionalidades do CRUD

- Criar uma tarefa com título, responsável e prioridade.
- Listar as tarefas cadastradas.
- Editar os dados e o estado de conclusão.
- Excluir uma tarefa.
- Consultar a saúde da aplicação em `/api/health`.

## Execução local

Requisito: Node.js 20 ou superior.

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

Para executar os testes automatizados:

```bash
npm test
```

## Execução com Docker Compose

```bash
docker compose up --build -d
docker compose ps
```

Acesse `http://IP_DA_VM:3000`. Os dados ficam no volume nomeado `taskflow-data`, portanto não são perdidos quando o contêiner é recriado.

## Runner local e deploy automático

O runner self-hosted é um agente instalado na VM. Depois de registrado no repositório, ele permanece aguardando trabalhos do GitHub Actions. O workflow `.github/workflows/deploy.yml` é acionado por um push na branch `main` e executado diretamente na VM.

O fluxo realiza quatro etapas:

1. baixa a versão mais recente do repositório;
2. executa os testes do CRUD;
3. reconstrói e reinicia os contêineres com `docker compose up --build -d`;
4. consulta `/api/health` e encerra com erro se a aplicação não responder corretamente.

O deploy utiliza um grupo de concorrência para impedir duas atualizações simultâneas. A opção `cancel-in-progress: true` mantém somente a alteração mais recente.

## Preparação da VM

As instruções detalhadas estão em [SETUP_VM.md](SETUP_VM.md), e o checklist final está em [ENTREGA.md](ENTREGA.md). Em resumo:

1. criar uma VM Ubuntu Server com rede acessível pelo laboratório;
2. instalar Git, Docker Engine e o plugin Docker Compose;
3. registrar um runner do tipo **self-hosted / Linux / x64** no repositório;
4. instalar o runner como serviço e confirmar que aparece como **Idle** no GitHub;
5. enviar uma alteração para `main` e acompanhar a execução na aba **Actions**.

## Acesso na rede do laboratório

- Endereço: `http://[IP_DA_VM]:3000`
- Porta TCP: `3000`
- Health check: `http://[IP_DA_VM]:3000/api/health`

> Substitua `[IP_DA_VM]` pelo endereço obtido com `hostname -I` dentro da máquina virtual.

## Demonstração sugerida

1. Abrir a aplicação e cadastrar uma tarefa.
2. Alterar o texto do cabeçalho em `public/index.html`.
3. Fazer commit e push para a branch `main`.
4. Mostrar a execução do workflow no GitHub.
5. Atualizar o navegador e comprovar que o novo texto foi implantado automaticamente.

## Estrutura do projeto

```text
.
|-- .github/workflows/deploy.yml
|-- data/tarefas.json
|-- public/
|   |-- app.js
|   |-- index.html
|   `-- style.css
|-- test/api.test.js
|-- Dockerfile
|-- compose.yaml
|-- ENTREGA.md
|-- package.json
|-- server.js
`-- SETUP_VM.md
```

