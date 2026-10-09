import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { analyze, extractTerms, formatResume, inputError, parseCriteria } from './analysis'
import './styles.css'
import { Button, Textarea } from './components/ui/controls'

const exampleJob = `Pessoa Desenvolvedora Front-end\n\nProcuramos pessoa com experiência em React, TypeScript, JavaScript, HTML, CSS, consumo de APIs, Git e trabalho com Scrum. Conhecimento em Node.js e Figma é desejável.`
const exampleResume = `Ana Souza\nana.souza@example.com | São Paulo, SP | https://example.com/portfolio\n\nExperiência profissional\nDesenvolvedora Front-end — Empresa Exemplo | 2023 - atual\n- Desenvolvimento de interfaces com React, TypeScript, HTML e CSS.\n- Integração com APIs REST e versionamento com Git.\n\nFormação\nTecnologia em Análise e Desenvolvimento de Sistemas — 2022\n\nHabilidades\nReact, TypeScript, JavaScript, HTML, CSS, Git, APIs REST`

function App() {
  const [job, setJob] = useState('')
  const [resume, setResume] = useState('')
  const [criteria, setCriteria] = useState('')
  const [custom, setCustom] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null)
  const [adjusted, setAdjusted] = useState('')
  const [formatMessage, setFormatMessage] = useState('')
  const [errors, setErrors] = useState({ job: '', resume: '' })
  const [feedback, setFeedback] = useState('')
  const [dirty, setDirty] = useState(false)
  const [edited, setEdited] = useState(false)
  const suggested = useMemo(() => extractTerms(job).join('\n'), [job])
  const activeCriteria = custom ? criteria : suggested

  function runAnalysis(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (edited && !window.confirm('Uma nova análise substitui suas edições pela formatação do original. Continuar?')) return
    const next = { job: inputError(job, 'a descrição da vaga'), resume: inputError(resume, 'o currículo') }
    setErrors(next)
    setFeedback('')
    if (next.job || next.resume) { setResult(null); return }
    setEdited(false)
    setResult(analyze(parseCriteria(activeCriteria), resume))
    const formatted = formatResume(resume)
    setAdjusted(formatted.text)
    setFormatMessage(formatted.message)
    setDirty(false)
  }
  function loadExample() {
    if (edited && !window.confirm('Carregar o exemplo descarta suas edições atuais. Continuar?')) return
    setEdited(false)
    setJob(exampleJob); setResume(exampleResume); setCustom(false); setCriteria('')
    setResult(null); setAdjusted(''); setFeedback(''); setErrors({ job: '', resume: '' }); setDirty(false)
  }
  async function copy() {
    try { await navigator.clipboard.writeText(adjusted); setFeedback('Currículo copiado com sucesso.') }
    catch { setFeedback('Não foi possível copiar. Selecione o texto editável e copie manualmente.') }
  }
  return <main className="page">
    <header className="intro">
      <span className="eyebrow">SEU PRÓXIMO PASSO, COM MAIS CLAREZA</span>
      <h1>Currículo Match<span>.</span></h1>
      <p>Compare os requisitos da vaga e prepare uma apresentação simples do seu currículo.</p>
      <span className="privacy">100% no navegador · Sem envio de dados</span>
      <p className="hint">A comparação e a organização do currículo usam regras locais, sem API de IA.</p>
    </header>

    <form onSubmit={runAnalysis} className="workspace">
      <div className="input-grid">
        <section className="card field">
          <label htmlFor="job"><span className="step">01</span> Descrição da vaga</label>
          <p className="hint" id="job-help">Cole a vaga, incluindo os requisitos.</p>
          <Textarea id="job" value={job} maxLength={40000} onChange={e => {
            setJob(e.target.value); setCustom(false); setCriteria(''); setDirty(true)
          }} aria-invalid={!!errors.job} aria-describedby="job-help job-error" placeholder="Quais habilidades e conhecimentos a vaga pede?" />
          <p id="job-error" className="error" role="alert">{errors.job}</p>
        </section>
        <section className="card field">
          <label htmlFor="resume"><span className="step">02</span> Seu currículo</label>
          <p className="hint" id="resume-help">Cole o texto mantendo as quebras entre seções.</p>
          <Textarea id="resume" value={resume} maxLength={40000} onChange={e => {
            setResume(e.target.value); setDirty(true)
          }} aria-invalid={!!errors.resume} aria-describedby="resume-help resume-error" placeholder="Nome, contato, experiências, formação e habilidades…" />
          <p id="resume-error" className="error" role="alert">{errors.resume}</p>
        </section>
      </div>

      <section className="card criteria">
        <label htmlFor="criteria"><span className="step">03</span> Requisitos extraídos automaticamente</label>
        <p id="criteria-help">Identificamos expressões nos trechos de requisitos, formação e experiência, sem restringir a profissão. Você já pode analisar; editar esta lista é opcional. Ao alterar a vaga, a lista é renovada. Use um termo por linha.</p>
        <Textarea id="criteria" rows={4} value={activeCriteria} maxLength={10000}
          aria-describedby="criteria-help" placeholder="Nenhum termo sugerido? Adicione aqui os requisitos da vaga."
          onChange={e => { setCustom(true); setCriteria(e.target.value); setDirty(true) }} />
        <div className="actions">
          <Button variant="link" type="button" onClick={() => { setCustom(false); setDirty(true) }}>Restaurar sugestões da vaga atual</Button>
          <small>{parseCriteria(activeCriteria).length} termos únicos · mínimo de 2 para calcular</small>
        </div>
      </section>
      <div className="actions">
        <Button type="submit">Analisar e ajustar</Button>
        <Button type="button" variant="outline" onClick={loadExample}>Carregar exemplo</Button>
      </div>
    </form>

    {result && <section className="results" aria-label="Resultado da análise">
      {dirty && <p className="notice" role="status">Os dados ou os termos mudaram. Clique em “Analisar e ajustar” para atualizar. Uma nova análise substitui as edições do currículo abaixo.</p>}
      <div className="card score">
        <div><span className="eyebrow">CORRESPONDÊNCIA TEXTUAL · CURRÍCULO ORIGINAL</span>
          <strong>{result.percentage === null ? 'Sem estimativa' : result.percentage + '%'}</strong>
          <p>{result.percentage === null ? 'Adicione pelo menos dois requisitos na lista acima. Você ainda pode editar e salvar o currículo.' : result.found.length + ' de ' + result.total + ' termos aparecem no currículo original.'}</p>
        </div>
        <p>Estimativa baseada em palavras-chave. Não reproduz a avaliação de todos os sistemas ATS.<br />A presença de um termo não comprova experiência ou proficiência.</p>
      </div>
      <div className="input-grid">
        <TermList title="Encontrados no texto" terms={result.found} tone="success" />
        <TermList title="Não encontrados no texto" terms={result.missing} tone="warning" />
      </div>
      <section className="card">
        <h2>O que revisar</h2>
        <ul className="suggestions">
          {result.missing.length > 0 && <li>Confira os termos não encontrados: {result.missing.join(', ')}. Só os inclua se corresponderem à sua experiência real.</li>}
          <li>A comparação é textual: não traduz entre idiomas nem avalia equivalência de diplomas, sinônimos ou nível de experiência. Vaga e currículo em idiomas diferentes podem ter baixa correspondência.</li>
          <li>Descreva atividades e resultados verificáveis nas suas experiências. Esta ferramenta não escreve novas qualificações.</li>
        </ul>
      </section>
      <section className="card adjusted">
        <h2>Seu currículo, organizado</h2>
        <p className="notice">Melhoramos a apresentação do seu currículo sem inventar experiências ou qualificações. Revise o resultado antes de enviar.</p>
        <p>{formatMessage} A organização local usa regras de formatação, sem reescrita semântica.</p>
        <details><summary>Consultar currículo original</summary><pre className="resume-preview">{resume}</pre></details>
        <label htmlFor="adjusted">Versão editável</label>
        <Textarea id="adjusted" value={adjusted} onChange={e => { setEdited(true); setAdjusted(e.target.value); setFeedback('') }} />
        <details><summary>Prévia de leitura e impressão</summary><pre className="resume-preview">{adjusted}</pre></details>
        <div className="actions">
          <Button type="button" disabled={!adjusted.trim()} onClick={copy}>Copiar currículo</Button>
          <Button type="button" variant="outline" disabled={!adjusted.trim()} onClick={() => window.print()}>Salvar como PDF</Button>
        </div>
        <p className="hint">Na impressão, selecione “Salvar como PDF” e desative cabeçalhos e rodapés do navegador. Apenas o texto atualmente editado será impresso.</p>
        <p role="status">{feedback}</p>
      </section>
    </section>}
    <footer>Seus textos ficam apenas nesta página. Ao recarregar, os dados são apagados.</footer>
    <article id="print-resume"><pre>{adjusted}</pre></article>
  </main>
}
function TermList({ title, terms, tone }: { title: string; terms: string[]; tone: string }) {
  return <section className="card term-list"><h2>{title} <span>({terms.length})</span></h2>
    {terms.length ? <ul className={tone}>{terms.map(term => <li key={term}>{term}</li>)}</ul> : <p>Nenhum termo nesta categoria.</p>}
  </section>
}
createRoot(document.getElementById('root')!).render(<App />)
