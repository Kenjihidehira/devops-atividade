# Configuração da VM e do runner self-hosted

## 1. Preparar o Ubuntu Server

Atualize os pacotes e instale as ferramentas básicas:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
```

Instale o Docker seguindo a documentação oficial da versão do Ubuntu usada no laboratório. Ao final, confirme:

```bash
docker --version
docker compose version
```

Adicione o usuário que executará o runner ao grupo `docker` e entre novamente na sessão:

```bash
sudo usermod -aG docker "$USER"
```

Libere a porta da aplicação, caso o UFW esteja ativo:

```bash
sudo ufw allow 3000/tcp
```

## 2. Registrar o runner

No repositório do GitHub, acesse:

`Settings > Actions > Runners > New self-hosted runner`

Selecione **Linux** e **x64**. Execute na VM os comandos mostrados pelo próprio GitHub. O token de registro é temporário e não deve ser salvo no repositório.

Depois da configuração, instale o runner como serviço:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Volte à página de runners e confirme o estado **Idle**.

## 3. Testar o deploy

Envie o projeto para a branch `main`. O workflow será iniciado automaticamente. Acompanhe em `Actions > Deploy automatico na VM`.

Na VM, valide:

```bash
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
hostname -I
```

Em outro computador da mesma rede, acesse `http://IP_DA_VM:3000`.

## 4. Evidências para a apresentação

- Tela do GitHub mostrando o runner online.
- Execução concluída com sucesso na aba Actions.
- Saída de `docker compose ps` na VM.
- Aplicação aberta pelo IP da VM.
- Uma mudança visual aparecendo após commit e push, sem deploy manual.

