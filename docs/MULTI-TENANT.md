# Uso com várias empresas

O sistema mantém a **mesma cara** para todos. A diferença está em:

1. **Link que você envia ao cliente**: já traz a empresa “embutida”; o cliente **não preenche** nome da empresa.
2. **Seu dashboard**: você escolhe **qual empresa** ver; os dados ficam separados por empresa.
3. **Nome amigável**: no painel você pode definir um nome (ex.: “Empresa Alpha”) que aparece no seletor e na visão geral em vez do slug.
4. **Encerrar coleta**: pode inativar um link (coleta encerrada); quem abrir o link verá uma mensagem e não poderá enviar novas respostas.
5. **Remover da lista**: remove a empresa da lista de links gerados (os dados já enviados continuam disponíveis).
6. **Canal de denúncias**: link com `?org=slug&channel=denuncia` abre o formulário anônimo de denúncias; as denúncias aparecem na aba “Denúncias” do dashboard.

## Link para o cliente (ele não preenche nada)

O tenant (empresa) vem da **URL**. Você envia um link com o identificador da empresa:

```
https://seusite.com/?org=empresa-alpha
https://seusite.com/?org=cliente-xyz
```

- Ao abrir esse link, o sistema usa automaticamente `empresa-alpha` (ou o slug que você colocou) como empresa.
- O cliente só escolhe o **setor** e responde ao formulário; não há campo “nome da empresa”.
- Todas as respostas ficam associadas a essa empresa.

**Sugestão de slug**: use algo único e fácil de identificar no dashboard, por exemplo o nome fantasia ou um código (`empresa-alpha`, `acme`, `cliente-2024-01`).

## Seu dashboard (diferenciar por empresa)

Quando você entra na **área administrativa** (senha):

1. No topo aparece um **seletor “Empresa”** com a lista de empresas que já têm pelo menos um envio.
2. Você escolhe uma empresa no dropdown.
3. Gráficos, totais e lista de envios passam a ser **só dessa empresa**.
4. Ao excluir um envio, a exclusão é feita no contexto da empresa selecionada.

Assim, a interface é a mesma para todo mundo; a separação dos dados é feita pelo **link** (para o cliente) e pelo **seletor de empresa** (para você no dashboard).

## Resumo

| Quem        | O que vê / o que faz |
|------------|----------------------|
| **Cliente** | Abre o link que você mandou (`?org=slug`). Só escolhe setor e responde. Não preenche empresa. |
| **Você**    | Entra no dashboard, escolhe a empresa no dropdown e vê apenas os dados daquela empresa. |

A lista de empresas no dropdown é montada automaticamente a partir dos `tenant_id` que já existem em envios (quem respondeu pelo link `?org=slug` já criou essa “empresa” no sistema).
