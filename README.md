# Currículo Match

Aplicação web do curso **Programação com IA Santander** para comparar um currículo com uma descrição de vaga e organizar sua apresentação em texto simples.

O projeto ajuda a identificar requisitos mencionados na vaga que aparecem ou não no currículo. A proposta é oferecer uma ferramenta pequena, fácil de usar e sem inventar experiências ou qualificações.

O desenvolvimento foi realizado com auxílio do Codex, adaptando o fluxo com Lovable sugerido no desafio. **A aplicação utiliza regras locais: não faz chamadas a modelos de IA.**

## Funcionalidades

- Entrada da descrição da vaga e do currículo por texto.
- Extração automática de requisitos, com edição manual e restauração das sugestões.
- Percentual estimado de correspondência textual e listas de termos encontrados e ausentes.
- Sugestões para revisão do currículo.
- Padronização de espaços, quebras de linha, marcadores e títulos reconhecidos.
- Currículo organizado e editável, com consulta ao original e prévia de impressão.
- Cópia do texto e exportação em PDF pela impressão do navegador.
- Exemplo fictício, validação dos campos e aviso de análise desatualizada.
- Confirmação antes de substituir edições manuais ao analisar novamente ou carregar o exemplo.
- Layout responsivo para computador e celular.

## Tecnologias

React, TypeScript, Vite e Tailwind CSS. Os controles de botão e campo de texto são componentes locais baseados no padrão shadcn/ui. Os testes usam o executor nativo do Node.js.

Não há backend, banco de dados, login, API externa ou configuração de credenciais.

## Como executar

Pré-requisitos: **Node.js 24** e npm. Execute os comandos na pasta que contém o `package.json`.

Instale as dependências:

```sh
npm ci
```

Inicie o ambiente de desenvolvimento:

```sh
npm run dev
```

Abra o endereço exibido pelo Vite no terminal. Não é necessário criar um arquivo `.env` nem iniciar outro servidor.

Para verificar o código e gerar a versão de produção:

```sh
npm test
npm run build
```

Para visualizar o build localmente:

```sh
npm run preview
```

O comando de preview requer um build anterior e serve para conferência local.

## Como usar

1. Cole a descrição da vaga e o currículo ou clique em **Carregar exemplo**.
2. Confira os requisitos extraídos. A edição dessa lista é opcional; use um termo por linha.
3. Clique em **Analisar e ajustar**.
4. Consulte o percentual, os termos encontrados, os ausentes e as sugestões.
5. Revise e edite o currículo organizado.
6. Clique em **Copiar currículo** ou **Salvar como PDF**.

Alterar a vaga renova os requisitos automaticamente. Alterar a vaga, o currículo ou a lista de requisitos exige uma nova análise para atualizar o resultado.

### Exemplo de uso

O exemplo incluído apresenta uma vaga de desenvolvimento front-end e o currículo fictício de Ana Souza. Há tecnologias compartilhadas, como React e TypeScript, e requisitos não mencionados no currículo, como Figma.

Use **Carregar exemplo** para experimentar o fluxo completo. Os textos também estão disponíveis em [docs/exemplo.md](docs/exemplo.md). Termos ausentes não são adicionados ao currículo automaticamente: inclua-os somente se corresponderem à experiência real da pessoa.

## Como a análise funciona

A aplicação extrai expressões da vaga usando títulos de seções e indicadores de requisitos. Remove palavras comuns, elimina duplicatas e permite revisar a lista antes da comparação.

A comparação ignora diferenças de capitalização e acentos, reconhece alguns aliases e respeita limites de palavras. Por exemplo, Java não é considerado presente apenas porque o currículo contém JavaScript.

O percentual é calculado sobre o **currículo original**:

```text
Correspondência = (termos encontrados / termos selecionados) × 100
```

O resultado é arredondado. Com menos de dois termos, a aplicação não calcula uma estimativa, mas continua permitindo organizar, editar e exportar o currículo.

### Limitações

- A extração é heurística e pode omitir requisitos ou selecionar expressões pouco relevantes.
- Todos os termos selecionados têm o mesmo peso.
- A comparação não interpreta negações, alternativas, equivalência de diplomas, proficiência ou tempo de experiência.
- Não há tradução entre idiomas nem interpretação semântica geral.
- A presença de um termo não comprova qualificação.
- O percentual não prevê contratação e não reproduz a avaliação de todos os sistemas ATS.

## Organização do currículo e PDF

A ferramenta preserva o conteúdo e a ordem das linhas, padronizando a apresentação. **Não reescreve o currículo conforme a vaga e não cria competências, experiências, resultados ou métricas.** As melhorias de conteúdo dependem da revisão manual do usuário.

Copiar e imprimir utilizam exatamente o texto atual do editor, incluindo as edições manuais.

Para exportar:

1. Clique em **Salvar como PDF**.
2. Selecione a opção de salvar em PDF na janela de impressão do navegador.
3. Desative cabeçalhos e rodapés do navegador.
4. Confira a prévia e salve o arquivo.

A impressão mostra somente o currículo, com texto preto, fundo branco e margens de 20 mm. Colunas ou tabelas cuja estrutura se perdeu ao colar o texto precisam de revisão manual.

## Privacidade

O processamento acontece no navegador. O código da aplicação não envia vaga ou currículo a serviços externos nem persiste esses textos em banco, cookies ou localStorage. Ao recarregar a página, o estado da aplicação é descartado.

## Mega prompt e refinamentos

O [mega prompt inicial](docs/mega-prompt.md) registra o pedido de construção. O [documento de ajustes](docs/prompt-ajustes.md) descreve o escopo atual.

Os principais refinamentos foram:

| Ajuste | Motivo |
| --- | --- |
| Requisitos editáveis e restauração das sugestões | Permitir corrigir limitações da extração automática. |
| Tratamento de termos técnicos, aliases e limites de palavras | Reduzir correspondências parciais e duplicações. |
| Aviso de análise desatualizada | Indicar quando as entradas já não correspondem ao resultado exibido. |
| Consulta ao original e prévia de impressão | Facilitar a revisão antes de copiar ou exportar. |
| Confirmação para substituir edições | Evitar descarte silencioso de alterações manuais. |
| Controles com Tailwind e padrão shadcn/ui | Alinhar a interface à proposta visual inicial. |
| Retorno ao processamento inteiramente local | Manter o projeto simples, sem integração externa, credenciais ou custos de API. |

## Verificação

A versão atual passou em **16 testes automatizados** e no build. Os testes cobrem extração, comparação, validação de entradas e formatação, incluindo diferenças de acentos, termos técnicos e preservação de conteúdo.

Esses testes não substituem a conferência da interface, da cópia e da impressão no navegador. Essa validação visual ainda precisa ser registrada antes da entrega.

## Publicação e entrega

O comando `npm run build` gera a pasta `dist`, pronta para hospedagem estática.

Configuração de publicação:

- Comando de instalação: `npm ci`.
- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Sem funções de servidor ou variáveis de ambiente.

Para a entrega do curso, publique a aplicação e disponibilize o código em um repositório público na sua conta do GitHub, com nome legível, em minúsculas e sem acentos. Envie o link do repositório.

Versione código, testes, documentação e `package-lock.json`. O `.gitignore` exclui dependências, build, arquivos de ambiente e exemplos pessoais da pasta `Exemplos`. Revise o conteúdo antes de publicar; arquivos já versionados não são removidos pelo `.gitignore`.

### Evidências da entrega

- Repositório: [AndreGarcia777/resume-match](https://github.com/AndreGarcia777/resume-match).
- Aplicação publicada: **a adicionar**.
- Captura de tela da análise: **a adicionar após a validação no navegador**.

Os campos acima são pendências de documentação; não representam links ou evidências já disponíveis.
