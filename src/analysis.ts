import { extractRequirements } from './requirements.ts'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}
const vocabulary: Record<string, string[]> = {
  'JavaScript': [], 'TypeScript': [], 'Java': [], 'C++': [], 'C#': [], '.NET': [],
  'Node.js': ['nodejs'], 'React Native': [], 'React': [], 'Python': [], 'PHP': [],
  'HTML': ['html5'], 'CSS': ['css3'], 'SQL': [], 'Git': [], 'Docker': [],
  'AWS': [], 'Azure': [], 'Angular': [], 'Vue': ['vue.js'], 'PostgreSQL': [],
  'MySQL': [], 'Figma': [], 'Scrum': [], 'Kanban': [], 'Linux': [],
  'APIs': ['api'], 'ClickUp': [], 'Loja Integrada': [], 'Tray': [], 'Nuvemshop': [],
  'Shopify': [], 'WordPress': [], 'Excel': [], 'Power BI': [], 'CRM': [],
  'Atendimento ao cliente': [], 'Gestão de projetos': [], 'Inglês': [],
  'Espanhol': [], 'Controle de estoque': [], 'Fluxo de caixa': [],
  'Conciliação bancária': [], 'Contas a pagar': [], 'Contas a receber': [],
  'Pacote Office': [], 'AutoCAD': [], 'SolidWorks': [], 'SAP': [], 'Totvs': [],
}
function literalMatch(text: string, term: string) {
  const escaped = normalize(term).replace(/[.*+?^{}()|[\]\\$]/g, '\\$&')
  return new RegExp('(?<![\\p{L}\\p{N}_+#])' + escaped + '(?![\\p{L}\\p{N}_+#])', 'u').test(normalize(text))
}
export function includesTerm(text: string, term: string) {
  const canonical = Object.keys(vocabulary).find(key => normalize(key) === normalize(term) || vocabulary[key].some(alias => normalize(alias) === normalize(term)))
  return (canonical ? [canonical, ...vocabulary[canonical]] : [term]).some(alias => literalMatch(text, alias))
}
export function extractTerms(job: string) {
  const terms = extractRequirements(job).map(term => Object.keys(vocabulary).find(key =>
    normalize(key) === normalize(term) || vocabulary[key].some(alias => normalize(alias) === normalize(term))) ?? term)
  return parseCriteria(terms.join('\n'))
}
export function parseCriteria(text: string) {
  const unique = new Map<string, string>()
  for (const line of text.split(/\n|;/)) {
    const term = line.trim().replace(/^[•*-]\s+/, '').trim()
    if (/[\p{L}]/u.test(term)) unique.set(normalize(term), term)
  }
  return [...unique.values()]
}
export function inputError(text: string, label: string) {
  if (!text.trim()) return 'Preencha ' + label + '.'
  if (text.length > 40000) return 'Use até 40.000 caracteres por campo.'
  if ((text.match(/\p{L}/gu) ?? []).length < 10 || new Set(normalize(text).match(/[\p{L}]+/gu)).size < 2) return 'Insira conteúdo útil em ' + label + '.'
  return ''
}
const sections: Record<string, string> = {
  'experiencia': 'EXPERIÊNCIA PROFISSIONAL', 'experiencia profissional': 'EXPERIÊNCIA PROFISSIONAL',
  'experiencias profissionais': 'EXPERIÊNCIA PROFISSIONAL', 'historico profissional': 'EXPERIÊNCIA PROFISSIONAL',
  'formacao': 'FORMAÇÃO ACADÊMICA', 'formacao academica': 'FORMAÇÃO ACADÊMICA',
  'educacao': 'EDUCAÇÃO', 'habilidades': 'HABILIDADES', 'competencias': 'COMPETÊNCIAS',
  'qualificacoes': 'QUALIFICAÇÕES', 'resumo profissional': 'RESUMO PROFISSIONAL',
  'objetivo': 'OBJETIVO', 'contato': 'CONTATO', 'contatos': 'CONTATOS',
  'idiomas': 'IDIOMAS', 'cursos': 'CURSOS', 'certificacoes': 'CERTIFICAÇÕES', 'projetos': 'PROJETOS',
}
export function formatResume(original: string) {
  const output: string[] = []
  for (const raw of original.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim().replace(/[\t \u00a0]+/g, ' ').replace(/^[•●▪*-]\s+/, '• ')
    const heading = sections[normalize(line.replace(/^#{1,6}\s+/, '').replace(/:$/, ''))]
    if (heading && output.length && output[output.length - 1] !== '') output.push('')
    if (line || output[output.length - 1]) output.push(heading ?? line)
  }
  const text = output.join('\n').trim()
  return { text, changed: text !== original, message: text === original
    ? 'Nenhum ajuste de formatação foi necessário. O texto original foi preservado.'
    : 'Espaços, quebras, marcadores e títulos reconhecidos foram padronizados. Confira a prévia.' }
}
export function analyze(criteria: string[], resume: string) {
  const found = criteria.filter(term => includesTerm(resume, term))
  const missing = criteria.filter(term => !includesTerm(resume, term))
  return { found, missing, total: criteria.length, percentage: criteria.length >= 2 ? Math.round(found.length / criteria.length * 100) : null }
}
