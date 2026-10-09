/** Extração por estrutura textual, sem catálogo de profissões ou ferramentas. */
const fold = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const requirementHeading = /^(?:pre[- ]?requisitos|requisitos|qualificacoes|competencias|habilidades|conhecimentos|desejavel|diferenciais|escolaridade|experiencia|idiomas?|qualifications|requirements|skills|education|what you bring|o que .*(?:precisa|buscamos|esperamos|importante)|sera um diferencial)/
const dutiesHeading = /^(?:responsabilidades|atribuicoes|atividades|responsibilities|duties|seu dia a dia|o que voce vai fazer)/
const excludedHeading = /^(?:beneficios|benefits|sobre nos|sobre a empresa|about us|overview|working conditions|remuneracao|salario|pagamento|local d[eo] trabalho|tipo de vaga|perguntas?\(?s?\)? de selecao|carga horaria|modalidade|bolsa[- ]auxilio|possibilidade de efetivacao)/
const cue = /\b(?:conhecimentos?|experiencia|familiaridade|dominio|vivencia|habilidade|formacao|cursando|certificacao|registro|experience|knowledge|proficiency|proficient|degree|certification|required|ability|able to)\b/i

// Palavras funcionais separam grupos nominais; conectores internos preservam
// expressões como "controle de estoque" e "Ciência da Computação".
const connectors = new Set('de da do das dos of'.split(' '))
const stop = new Set(`a o as os um uma uns umas e ou em no na nos nas com sem para por ao aos the a an and or in on with without for to from at by as is are be have has will your our you we their its
  conhecimento conhecimentos experiencia experiencias familiaridade dominio vivencia habilidade habilidades capacidade formacao cursando curso completo completa basico basica basicos basicas avancado avancada intermediario intermediaria nivel obrigatorio obrigatoria preferencial desejavel diferencial necessario necessaria previa previo relacionados relacionadas afins correlatas areas area
  ability able knowledge experience experienced proficiency proficient skills skill required preferred requirements qualifications demonstrated exceptional strong excellent good including include such etc
  trabalhar trabalho atuar atuacao utilizar utilizando desenvolver desenvolvimento implementar implementacao realizar conduzir compreender entender garantir garantindo identificar avaliar selecionar levantar criar comunicar colaborar acompanhar investigar propor traduzir integrar apoiar fazer ter ser saber sabe utilizar
  develop recommend organize implement evaluate identify solve present defend interact perform provide maintain assess review utilize research support carry out draw sufficient determined
  bom boa algum alguma como dentre outras outros entre ate mais menos anos ano months years one two three four five
  estamos busca buscamos procuramos nosso nossa nossos nossas pessoa candidato candidatos profissional profissionais time equipe times empresa cliente clientes people company client clients staff members organization
  claro clara claras claro relevante relevantes diferentes grandes novas novas forma totalmente pouco pouco muito negocio negocios demandas necessidades resultados solucoes ferramentas tecnicas ambientes tecnicos tecnica tecnicas tecnicas
  related equivalent combination essential functions job appropriate needs efficient effective all various little under times multiple other manner accurately into through upon based assigned specific accurate diverse levels variety
  atividades baseadas entendimento interesse construir carreira interrompido s º ª
  problemas informacoes compreensiveis acionaveis publicos reunioes variaveis volumes leitura
  education policy initiatives programs meeting changes conclusions information finished comprehensive responsibilities audiences representatives board effectively across cultural
  using use used work working prior basic advanced intermediate must should can also well per`.split(/\s+/))

function phrases(text: string): string[] {
  const result: string[] = []
  let words: string[] = []
  const flush = () => {
    while (words.length && connectors.has(fold(words[0]))) words.shift()
    while (words.length && connectors.has(fold(words[words.length - 1]))) words.pop()
    // Frases muito longas são descartadas: não são expressões curtas confiáveis.
    if (words.length && words.length <= 7) result.push(words.join(' '))
    words = []
  }
  const prepared = text.replace(/\be\/ou\b/gi, ',').replace(/\band\/or\b/gi, ',').replace(/['’]s\b/g, '')
  for (const token of prepared.match(/(?:\.[\p{L}]+|[\p{L}][\p{L}\p{N}]*(?:[./-][\p{L}\p{N}]+)*[+#]{0,2}|[^\s])/gu) ?? []) {
    const key = fold(token)
    if (!/\p{L}/u.test(token) || stop.has(key)) flush()
    else words.push(token)
  }
  flush()
  return result.filter(value => !/^(?:descricao|requisitos|desejavel|responsabilidades|qualifications|requirements)$/i.test(fold(value)))
}

export function extractRequirements(job: string): string[] {
  const primary: string[] = []
  const implicit: string[] = []
  const duties: string[] = []
  const fallback: string[] = []
  let mode: 'intro' | 'requirements' | 'duties' | 'excluded' = 'intro'
  for (const raw of job.split(/\r?\n|;|(?<=[.!?])\s+(?=[A-ZÀ-Ú])/u)) {
    const line = raw.trim().replace(/^[•*#\-\d.)\s]+/, '')
    if (!line) continue
    const normalized = fold(line)
    if (excludedHeading.test(normalized)) { mode = 'excluded'; continue }
    if (/^(?:se voce|vem |we are|equal opportunity)/.test(normalized)) { mode = 'excluded'; continue }
    const colon = line.indexOf(':')
    const heading = colon >= 0 ? normalized.slice(0, colon) : normalized
    const isHeading = colon >= 0 || line.split(/\s+/).length <= 9
    if (isHeading && requirementHeading.test(heading) && (colon >= 0 || !cue.test(normalized) || /^(?:experiencia|conhecimentos?|escolaridade|idiomas?)$/.test(normalized))) {
      mode = 'requirements'
      if (colon < 0) continue
    } else if (isHeading && dutiesHeading.test(heading)) {
      mode = 'duties'
      if (colon < 0) continue
    }
    const content = colon >= 0 && (requirementHeading.test(heading) || dutiesHeading.test(heading)) ? line.slice(colon + 1) : line
    if (mode === 'excluded') continue
    if (mode === 'requirements') primary.push(content)
    else if (cue.test(normalized)) implicit.push(content)
    else if (mode === 'duties') duties.push(content)
    else if (!/^(?:descricao|estamos|buscamos|procuramos|a missao|at |the |overview)/.test(normalized)) fallback.push(content)
  }
  const selected = primary.length ? primary : implicit.length ? implicit : duties.length ? duties : fallback
  const unique = new Map<string, string>()
  for (const line of selected) for (const phrase of phrases(line)) {
    const key = fold(phrase)
    if (!unique.has(key)) unique.set(key, phrase)
  }
  return [...unique.values()].filter(phrase => {
    const key = fold(phrase)
    if (key === 'superior') return false
    // Não contabilize a palavra genérica isolada novamente quando já existe
    // uma expressão específica que a contém no conjunto de requisitos.
    return key.includes(' ') || ![...unique.keys()].some(other => other !== key && other.split(' ').includes(key))
  })
}
