import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { analyze, extractTerms, formatResume, includesTerm, inputError, parseCriteria } from '../src/analysis.ts'

test('termos técnicos e pontuação não produzem correspondências parciais', () => {
  for (const term of ['C++', 'C#', '.NET', 'Node.js', 'Java']) assert.equal(includesTerm(term + '.', term), true)
  assert.equal(includesTerm('JavaScript', 'Java'), false)
  assert.equal(includesTerm('MySQL', 'SQL'), false)
  assert.equal(includesTerm('nodejs', 'Node.js'), true)
  assert.equal(includesTerm('GESTAO DE PROJETOS', 'Gestão de projetos'), true)
})
test('sugestões evitam palavras avulsas, duplicações e benefícios', () => {
  assert.deepEqual(extractTerms('Descrição: estamos em busca de alguém para nossas lojas.\nRequisitos:\nJavaScript, Loja Integrada e ClickUp.\nBenefícios:\nCurso de Excel.'), ['JavaScript', 'Loja Integrada', 'ClickUp'])
  assert.deepEqual(extractTerms('React Native e Node.js, nodejs'), ['React Native', 'Node.js'])
})
test('critérios revisados permitem vagas fora do vocabulário', () => {
  const terms = parseCriteria(' soldagem TIG\nSOLDAGEM TIG\nleitura de desenhos')
  assert.equal(terms.length, 2)
  assert.equal(analyze(terms, 'Experiência em soldagem TIG.').percentage, 50)
  assert.equal(analyze([], 'Currículo').percentage, null)
  assert.equal(analyze(['Excel'], 'Excel').percentage, null)
})
test('formatação preserva identificadores e conteúdo sem acrescentar requisitos', () => {
  const original = 'Ana Souza\r\nana@example.com | +55 00 00000-0000\r\nExperiência profissional:\r\nEmpresa X — Analista | 2022-2024\r\n- Atendimento ao cliente.\r\nFormação acadêmica:\r\nCurso Técnico'
  const result = formatResume(original)
  assert.equal(result.text, 'Ana Souza\nana@example.com | +55 00 00000-0000\n\nEXPERIÊNCIA PROFISSIONAL\nEmpresa X — Analista | 2022-2024\n• Atendimento ao cliente.\n\nFORMAÇÃO ACADÊMICA\nCurso Técnico')
  assert.equal(formatResume(result.text).changed, false)
  assert.equal(formatResume('Nome Sobrenome\nTexto sem seções claras.').changed, false)
})
test('entradas vazias ou sem conteúdo útil são rejeitadas', () => {
  for (const value of ['', '   ', '1234567890000', '.................', 'aaaaaaaaaaaa']) assert.ok(inputError(value, 'a vaga'))
  assert.equal(inputError('Experiência com atendimento', 'a vaga'), '')
})
test('exemplo documentado produz cálculo utilizável', () => {
  const example = readFileSync(new URL('../docs/exemplo.md', import.meta.url), 'utf8')
  const [job, resume] = example.split('## Currículo')
  const result = analyze(extractTerms(job), resume)
  assert.ok(result.percentage > 0 && result.percentage < 100)
  assert.ok(result.missing.includes('Figma'))
})
