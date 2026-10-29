# Checklist de entrega do Trabalho 2

## Dados do trabalho

- Trabalho: Trabalho 2 - Deploy automático em VM
- Aluno 1: Wesley Kenji Ito Hidehira - RA 250257
- Aluno 2: [PREENCHER NOME E RA]
- URL do repositório: <https://github.com/Kenjihidehira/devops-atividade>
- URL da aplicação na rede do laboratório: `http://[IP_DA_VM]:3000`

## Antes de publicar

- [ ] Preencher o nome e o RA do segundo integrante no `README.md` e neste arquivo.
- [ ] Criar um repositório vazio no GitHub.
- [ ] Enviar todos os arquivos para a branch `main`.
- [ ] Confirmar que o repositório permite execução de GitHub Actions.

Comandos sugeridos para o primeiro envio:

```bash
git init
git add .
git commit -m "feat: adiciona CRUD TaskFlow e deploy automatico"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

## Infraestrutura e demonstração

- [ ] Criar a VM Ubuntu Server.
- [ ] Instalar Git, Docker e Docker Compose.
- [ ] Registrar o runner self-hosted no repositório.
- [ ] Confirmar o runner com estado **Idle**.
- [ ] Fazer um push e confirmar a execução do workflow.
- [ ] Acessar a aplicação pelo navegador usando o IP da VM.
- [ ] Alterar um texto da interface e demonstrar o novo deploy automático.

## Evidências recomendadas

- [ ] Captura do runner online em `Settings > Actions > Runners`.
- [ ] Captura do workflow concluído na aba `Actions`.
- [ ] Captura da aplicação aberta pelo IP da VM.
- [ ] Captura de `docker compose ps` mostrando o contêiner saudável.

## Validação local realizada

Em 29/10/2026, o projeto foi validado localmente com:

- testes automatizados do fluxo CRUD aprovados;
- imagem Docker compilada com sucesso;
- aplicação acessível na porta `3000`;
- criação, atualização e exclusão de tarefa confirmadas pela API;
- health check do contêiner configurado para responder a `GET` e `HEAD`.

## Envio ao líder de sala

Enviar a URL completa do repositório e os dados dos dois integrantes. O líder deverá registrar o item como **Trabalho 2** na planilha da turma.
