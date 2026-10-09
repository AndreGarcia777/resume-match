import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { analyze, extractTerms, includesTerm } from '../src/analysis.ts'

// Termos intencionalmente ausentes do antigo catálogo: cobertura por estrutura.
const cases = [
  ['Enfermagem', 'Requisitos:\nConhecimento em triagem clínica e curativos.\nRegistro no COREN.', ['triagem clínica', 'curativos', 'COREN']],
  ['Direito', 'Qualificações:\nExperiência com contencioso cível e peticionamento eletrônico.', ['contencioso cível', 'peticionamento eletrônico']],
  ['Cozinha', 'Pré-requisitos:\nPanificação artesanal\nSegurança alimentar', ['Panificação artesanal', 'Segurança alimentar']],
  ['Educação', 'O que esperamos:\nAlfabetização\nPlanejamento pedagógico', ['Alfabetização', 'Planejamento pedagógico']],
  ['Logística', 'Experiência em inventário rotativo e operação de empilhadeira.', ['inventário rotativo', 'operação de empilhadeira']],
  ['Marketing', 'Requirements:\nKnowledge of audience segmentation and campaign attribution.', ['audience segmentation', 'campaign attribution']],
  ['Ferramenta inédita', 'Requisitos: conhecimento em AcmeStudio e FluxoZeta.', ['AcmeStudio', 'FluxoZeta']],
]
for (const [area, job, expected] of cases) test('extração aberta — ' + area, () => {
  const terms = extractTerms(job)
  for (const term of expected) assert.ok(terms.some(candidate => includesTerm(candidate, term)), term + ' ausente: ' + terms)
  const match = analyze(terms, expected.join('; '))
  assert.notEqual(match.percentage, null)
  assert.ok(match.percentage > 0)
})
test('não depende do CV, distingue zero de ausência de critérios e descarta benefícios', () => {
  const terms = extractTerms('Requisitos:\nManicure\nPedicure\nBenefícios:\nPlano odontológico e vale transporte')
  assert.deepEqual(terms, ['Manicure', 'Pedicure'])
  assert.equal(analyze(terms, 'Desenvolvimento de software').percentage, 0)
  assert.deepEqual(extractTerms('Benefícios:\nPlano odontológico e vale transporte'), [])
})
test('preserva termos pontuados, siglas curtas e alternativas', () => {
  assert.deepEqual(extractTerms('Requisitos:\nC++, C#, .NET, Node.js, Python e/ou R'), ['C++', 'C#', '.NET', 'Node.js', 'Python', 'R'])
})
const jobPath = new URL('../Exemplos/vagas.txt', import.meta.url)
const cvPath = new URL('../Exemplos/cv.txt', import.meta.url)
test('regressão local: todas as vagas fornecidas geram comparação automática', {
  skip: !existsSync(jobPath) || !existsSync(cvPath),
}, () => {
  const jobs = readFileSync(jobPath, 'utf8').split(/#+ VAGA \d+ #+/).filter(text => text.trim())
  const cv = readFileSync(cvPath, 'utf8')
  assert.equal(jobs.length, 4)
  for (const job of jobs) {
    const terms = extractTerms(job)
    const result = analyze(terms, cv)
    assert.ok(terms.length >= 2)
    assert.notEqual(result.percentage, null)
    assert.ok(result.percentage >= 0 && result.percentage <= 100)
    assert.ok(!terms.some(term => /pagamento|remoto|por mês|pinkerton|tech6/i.test(term)))
  }
})
