# Projeto: Currículo Match

Crie uma aplicação web simples para o curso “Programação com IA Santander”.

A aplicação deve comparar um currículo com uma descrição de vaga, mostrar uma estimativa de compatibilidade e preparar uma versão do currículo com apresentação adequada para ATS.

Priorize uma implementação pequena, funcional e fácil de explicar. Não amplie o escopo.

## Como trabalhar

1. Inspecione a pasta atual e leia as instruções existentes antes de alterar arquivos.
2. Se houver um projeto iniciado, aproveite sua estrutura.
3. Se a pasta estiver vazia, use React, TypeScript e Vite.
4. Implemente diretamente, sem uma longa etapa de planejamento.
5. Tome decisões simples e prossiga sem pedir confirmação para detalhes comuns.
6. Não use subagentes.
7. Não instale dependências quando recursos nativos forem suficientes.
8. Ao terminar, execute o build e as verificações disponíveis. Informe o que foi validado e qualquer limitação real.

## Escopo fechado

Uma única página, em português brasileiro, contendo:

- Nome “Currículo Match” e uma descrição curta.
- Campo grande para colar a descrição da vaga.
- Campo grande para colar o currículo.
- Botão “Analisar e ajustar”.
- Botão secundário “Carregar exemplo”, preenchendo os campos com dados fictícios.
- Área de resultados com:
  - Percentual estimado de compatibilidade.
  - Palavras-chave encontradas.
  - Palavras-chave ausentes.
  - Sugestões curtas de melhoria.
  - Currículo ajustado em um campo editável.
  - Botão “Copiar currículo”.
  - Botão “Salvar como PDF”.

Não implemente login, cadastro, banco de dados, histórico, dashboard, upload de arquivos, exportação para Word, pagamentos ou integrações externas.

## Análise simples e transparente

Nesta primeira versão, use uma análise local por regras, sem API de IA em tempo de execução, sem backend e sem chaves.

A IA será utilizada no desenvolvimento do projeto. A interface e o README devem explicar que a análise da aplicação utiliza regras de comparação textual.

Implemente:

- Normalização de maiúsculas, minúsculas e acentos.
- Extração de termos relevantes da vaga.
- Remoção de palavras comuns do português e termos genéricos sem valor para a comparação.
- Remoção de termos duplicados.
- Preservação de termos técnicos como C++, C#, .NET e Node.js.
- Comparação por palavras ou expressões completas, evitando que “Java” seja considerado presente apenas porque existe “JavaScript”.
- Percentual calculado pela proporção de termos relevantes da vaga encontrados no currículo.
- Tratamento do caso em que não há termos suficientes para calcular um resultado útil.

Exiba perto do percentual:

“Estimativa baseada em palavras-chave. Não reproduz a avaliação de todos os sistemas ATS.”

Não apresente o resultado como previsão de contratação.

## Ajuste do currículo

A versão ajustada deve ser conservadora:

- Preservar as informações e os fatos fornecidos pelo usuário.
- Normalizar espaços, quebras de linha e marcadores.
- Padronizar títulos de seções quando forem claramente identificáveis.
- Usar uma apresentação linear, sem tabelas ou colunas.
- Preservar nome, contatos, empresas, cargos, datas e qualificações.
- Não criar resumo profissional, resultados, competências ou experiências que não estejam no texto original.
- Quando o texto não permitir identificar seções com segurança, preservar sua organização e ajustar apenas a formatação.

Palavras-chave ausentes devem gerar sugestões separadas. Nunca devem ser incluídas automaticamente como competências.

Informe que esta versão organiza a apresentação do currículo e não faz uma reescrita semântica com IA.

Exiba de forma visível:

“Melhoramos a apresentação do seu currículo sem inventar experiências ou qualificações. Revise o resultado antes de enviar.”

## Design

Use componentes básicos do shadcn/ui e Tailwind CSS, evitando adicionar componentes desnecessários.

Paleta:

- Fundo: #F8FAFC
- Texto principal: #0F172A
- Cor primária: #2563EB
- Sucesso: #15803D
- Atenção: #B45309
- Bordas: #E2E8F0

Estilo limpo, com boa legibilidade e poucos elementos decorativos.

No desktop, os dois campos de entrada podem ficar lado a lado. No celular, devem ficar empilhados.

Use rótulos acessíveis, foco visível e contraste adequado. Não dependa apenas de cores para comunicar resultados.

## Comportamento

- Valide campos vazios e entradas sem conteúdo útil.
- Mostre erros em português, próximos aos campos.
- Não use espera artificial ou animação de processamento desnecessária.
- Ao analisar novamente, atualize todos os resultados.
- O botão de copiar deve utilizar o currículo atualmente editado e informar sucesso ou falha.
- Não salve os textos em localStorage, cookies ou serviços externos.
- Informe que o processamento acontece no navegador.

## PDF

Use a impressão nativa do navegador com CSS específico para impressão.

O botão deve abrir a impressão e orientar o usuário a selecionar “Salvar como PDF”.

A impressão deve mostrar somente o currículo atualmente editado, com fundo branco, texto preto, margens adequadas e sem campos, botões ou relatório de compatibilidade.

Não adicione biblioteca de geração de PDF.

## Organização e documentação

Mantenha poucos arquivos e extraia a lógica de análise para uma função ou módulo separado da interface.

Crie:

- README.md
- docs/mega-prompt.md com este prompt.
- docs/exemplo.md com a vaga e o currículo fictícios usados no exemplo.

O README deve explicar:

1. O problema que a aplicação resolve.
2. Funcionalidades e limites da análise por regras.
3. Como o percentual é calculado.
4. Como o currículo é formatado sem inventar informações.
5. Como instalar, executar e gerar o build.
6. Como copiar e salvar o currículo em PDF.
7. Onde está o mega prompt.
8. Refinamentos realmente realizados durante o desenvolvimento.

Inclua um espaço claramente identificado para adicionar o endereço publicado e uma captura de tela posteriormente. Não invente URLs, screenshots ou etapas realizadas.

Não publique a aplicação nem crie um repositório remoto nesta etapa.

## Critérios de conclusão

Verifique:

- O exemplo fictício produz uma análise utilizável.
- Campos vazios exibem mensagens claras.
- Diferenças de acentos e capitalização são tratadas.
- Java e JavaScript não são confundidos.
- O currículo ajustado não recebe informações inventadas.
- A edição do resultado é respeitada ao copiar e imprimir.
- A interface funciona em telas pequenas.
- O build termina sem erros.

Use testes pequenos para os casos relevantes da lógica, caso exista infraestrutura de testes. Não crie uma estrutura grande só para testar.

Finalize com um resumo curto dos arquivos criados, como executar, verificações realizadas e pendências para publicação.
