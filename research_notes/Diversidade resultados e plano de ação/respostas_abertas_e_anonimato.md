# Respostas abertas e anonimato em pesquisas internas de D&I (análise, apresentação e salvaguardas)

> Contexto: CONFIARA (SaaS brasileiro). A pesquisa anônima de D&I de um escritório de advocacia tem 2 perguntas abertas, Q1 "O que você entende por D&I no trabalho?" e Q2 "Que ação concreta você gostaria que o escritório adotasse nos próximos 12 meses?", e um campo "Outro (especifique)" em múltipla escolha. As respostas são em português, os resultados ficam ocultos abaixo de 5 respostas, os textos abertos aparecem em ordem aleatória e não há coleta de dados demográficos nem de departamento. A amostra típica é de 20 a 150 pessoas. O comitê lê as respostas em reunião e monta planos de ação.
> Notas escritas em português (pt-BR). Termos de produto ficam em inglês. Em "Inferências" estão as recomendações aplicáveis ao CONFIARA. São conclusões minhas a partir das fontes, não afirmações das fontes.

---

## 1. Codificação qualitativa de comentários: codebook, marcação, contagem de temas, esforço e concordância entre codificadores

### Takeaway
A prática consolidada é a análise temática: ler tudo, codificar, agrupar em temas, revisar e nomear. Para dar consistência, usa-se um codebook iterativo testado em amostras e, quando há mais de um codificador, comparam-se as codificações. Os grandes fornecedores mostram contagem de comentários por tema e sentimento, e para um comitê não técnico isso funciona bem quando cada tema traz exemplos reais. Com 20 a 150 respondentes e 2 perguntas, a codificação manual completa é viável, e a dupla codificação também.

### Cited Findings
- A análise temática reflexiva de Braun & Clarke tem seis fases: familiarização, codificação, geração inicial de temas, desenvolvimento e revisão de temas, refinamento e nomeação, e escrita. — [Braun & Clarke, Thematic Analysis (UWE repository)](https://uwe-repository.worktribe.com/output/6633690)
- Na abordagem reflexiva, codificar e desenvolver temas é um processo orgânico e, em última instância, subjetivo, diferente das escolas centradas em *coding reliability*. — [Braun & Clarke (UWE repository)](https://uwe-repository.worktribe.com/output/6633690)
- O método vale para respostas abertas de questionários, além de entrevistas e grupos focais (fonte secundária). — [CASRAI, Thematic analysis explained](https://casrai.org/guides/thematic-analysis-explained)
- O processo do Pew Research Center tem quatro passos. Primeiro, *open coding* de uma amostra inicial para mapear conceitos recorrentes. Depois, o codebook é testado em várias amostras aleatórias e revisado a cada rodada a partir das discordâncias. No estudo de 2026 foram necessárias 4 iterações e no de 2024, 5. — [Pew 2026, Appendix B: coding methodology](https://www.pewresearch.org/global/2026/02/17/appendix-b-coding-methodology-national-pride/); [Pew 2024, Appendix A: coding methodology](https://www.pewresearch.org/global/2024/03/13/appendix-a-coding-methodology-democracy/)
- O Pew exige confiabilidade intercodificadores (Krippendorff's alpha) de pelo menos 0,70 por código (30 códigos em 2026). Novos codificadores treinam com 150 respostas já consensuadas e recebem feedback se ficarem abaixo de 0,70. — [Pew 2026](https://www.pewresearch.org/global/2026/02/17/appendix-b-coding-methodology-national-pride/)
- O Pew também agrupa códigos depois da codificação: em 2024, 25 códigos viraram 18 códigos "primários" para focar a análise em temas. — [Pew 2024](https://www.pewresearch.org/global/2024/03/13/appendix-a-coding-methodology-democracy/)
- A confiabilidade intercodificadores (ICR) é controversa na pesquisa qualitativa. Para O'Connor & Joffe (2020), ela pode aumentar a sistematicidade e a transparência, promover reflexividade e diálogo na equipe e dar confiança ao público na análise. O artigo traz diretrizes práticas para avaliar ICR. — [O'Connor & Joffe, IJQM 2020](https://journals.sagepub.com/doi/10.1177/1609406919899220)
- No relatório de comentários do Viva Glint, a visão geral mostra o total de comentários (como número de pessoas que comentaram e % dos respondentes), um gráfico de barras de sentimento (positivo/negativo/neutro) e os tópicos mais citados com o número de menções. — [Microsoft Learn, Viva Glint Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- No Glint, nem todo comentário recebe tópico: se não se encaixa na taxonomia padrão, aparece como "N/A". — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- O Glint registra que comentários de pesquisa tendem a ser mais negativos que positivos e recomenda não levá-los para o lado pessoal. Também recomenda explorar os comentários **depois** de revisar os escores. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- Um resumo de tabela de temas codificados costuma trazer categoria, número de respostas e porcentagem, e o gráfico de barras é a forma natural de exibir contagens por tema. Codificar dá mais rigor que nuvem de palavras, mas custa mais tempo (fontes de mercado, resumo de busca). — [Drive Research](https://driveresearch.com/?p=2913); [Koji, qualitative data visualization guide](https://www.koji.so/docs/qualitative-data-visualization-guide)

### Inferências (recomendações para o CONFIARA)
- **Processo leve e defensável para 20 a 150 respostas.** São 2 perguntas abertas, então no máximo cerca de 300 textos curtos. O fluxo sugerido:
  1. Um curador (RH/DPO/consultor, fora do comitê) lê tudo e faz a passada de redação (ver seção 5).
  2. Dois membros codificam **todas** as respostas de forma independente, com um codebook inicial de 8 a 15 temas por pergunta e permissão para mais de um tema por resposta.
  3. Reunião curta de reconciliação. As discordâncias ajustam as definições do codebook, como no Pew.
  4. O comitê recebe o resultado consolidado.
  Com essa amostra não vale a pena calcular kappa/alpha. Basta registrar que houve dupla codificação e consenso, e citar o benchmark de 0,70 do Pew se alguém pedir rigor.
- **Codebook de partida, a validar com os dados e sem base em fonte.** Para a Q1 (entendimento): representatividade/presença de grupos diversos; inclusão como pertencimento e respeito; equidade de oportunidades/meritocracia; acessibilidade/PcD; respostas céticas ou de resistência; respostas vagas ou confusas. Para a Q2 (ação): letramento/treinamentos; recrutamento e seleção diversos; carreira, mentoria e promoção; combate a assédio e discriminação (canal, apuração); acessibilidade; parentalidade e flexibilidade; metas, indicadores e transparência; grupos de afinidade; compromisso da liderança; equidade salarial. Sempre manter "Outros" e "Sem ação concreta / não sabe".
- **Contagens por tema: mostrar.** Elas ajudam o comitê a priorizar. O denominador deve ser "pessoas que responderam a esta pergunta", e não o total da pesquisa, no padrão Glint de "commenters" e "% dos respondentes". Deixar explícito que uma resposta pode ter vários temas, então a soma passa de 100%. Para temas com menos de 3 menções, agrupar em "Outros temas (poucas menções)" ou mostrar só "menções pontuais", sem número exato. Isso evita falsa precisão e reduz a exposição de opiniões singulares.
- **Ligar a Q2 ao plano de ação.** Cada tema da Q2 vira uma linha de backlog com: tema, n de menções, 1 a 3 citações, e colunas preenchidas pelo comitê (impacto, esforço, responsável, prazo, indicador). Isso transforma a leitura em plano. Combina com a recomendação do Glint de usar comentários "prescritivos" para agir.
- **Separar leitura de análise.** O relatório deve trazer (a) temas com contagem e citações e (b) um anexo com **todas** as respostas redigidas, para o comitê poder conferir que não houve escolha seletiva (ver seção 4).

### Gaps
- Não encontrei fonte confiável com horas-pessoa por comentário para codificar manualmente pesquisas de clima/D&I. Qualquer estimativa de esforço seria minha.
- Não li o texto completo de O'Connor & Joffe, então não confirmo limiares específicos de kappa/alpha recomendados por eles. Os números 0,80/0,667 de um site de fornecedor não foram verificados.
- Não encontrei codebook público e validado para perguntas abertas de D&I em português.

---

## 2. Como as plataformas categorizam comentários e mostram sentimento (Culture Amp, Qualtrics Text iQ, Viva Glint, Peakon, Lattice, Leapsome)

### Takeaway
Todos os grandes fornecedores fazem o mesmo: classificam cada comentário em tópicos de uma taxonomia fixa ou gerada, atribuem sentimento (positivo/negativo/neutro, às vezes "misto"), mostram contagem por tópico e destacam alguns comentários representativos. Cada vez mais isso é feito por LLM. Todos alertam que a classificação pode errar e mandam ler os comentários originais. Comentários em português costumam ser traduzidos para o inglês antes, com perda de nuance.

### Cited Findings
**Viva Glint (Microsoft)**
- O relatório mostra tópicos, sentimento, palavras-chave e comentários representativos. Tópicos e palavras-chave aparecem em visão de nuvem ou de tabela, com cor por sentimento (azul positivo, cinza neutro, vermelho negativo) e tamanho por volume. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- O Glint classifica cada comentário como positivo, negativo, neutro ou misto. Um comentário misto conta como meio positivo e meio negativo. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- Comentários em outro idioma são traduzidos para o inglês antes da atribuição de tópico, e o idioma precisa estar habilitado **antes** das respostas. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- A atribuição de tópicos aprimorada pelo Copilot usa LLM com quatro restrições: só classifica na taxonomia aprovada, a saída segue um JSON schema, há validação server-side por allowlist e há filtro de segurança antes do envio. Ela respeita os limiares de confidencialidade e não identifica indivíduos. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- A Microsoft avisa que atribuições de tópico por IA podem estar erradas. Antes de usar tópicos em comunicação da liderança ou em plano de ação, é preciso revisar os comentários relacionados. Tópicos não devem embasar avaliação, promoção, remuneração ou disciplina. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- Comparar tópicos de antes e depois da mudança para LLM exige cuidado: a diferença pode vir do novo mapeamento e não de mudança real no feedback. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- O Glint sugere ler "comentários representativos" (uma lista curta que representa os temas) e "prescritivos" (sugestões acionáveis). Também permite redigir PII/palavrões (substituídos por "#####") e pôr comentários em quarentena, visíveis só para admins. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- O sinalizador de comentários sensíveis do Glint tem três categorias: palavrões, PII (por exemplo, nomes) e "ambiente de trabalho sensível" (discriminação, assédio, condições inseguras, bullying). **Não funciona para comentários fora do inglês.** — [Microsoft Learn, Flag sensitive comments](https://learn.microsoft.com/en-us/viva/glint/setup/glint-sensitive-comments)

**Culture Amp**
- Desde maio de 2025, um LLM marca cada comentário com tópico e sentimento (Positive/Negative/Neutral) usando o comentário e a pergunta. "Neutral" passou a incluir comentários mistos. — [Culture Amp Support, Emerging themes / AI comment summaries](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- Um resumo de IA exige pelo menos 5 comentários "significativos" na pergunta: mais de 2 palavras, com tag de tópico e tag de sentimento. Com 5 ou mais no total mas menos de 5 por sentimento, aparece só um resumo "Overall". Atenção: um resumo de busca citava 3 comentários, mas a página oficial que li diz 5. — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- Comentários representativos: 3 quando há menos de 20 comentários e 5 quando há mais de 20. Não ficam disponíveis com múltiplos filtros demográficos. — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- Textos em outros idiomas são traduzidos para o inglês pelo Google Translate antes do resumo, e "alguma nuance pode se perder". O texto "Other" de múltipla escolha **não** é resumido. Nomes podem aparecer ocasionalmente nos resumos (o suporte ajuda a redigir). — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- A Culture Amp recomenda explorar os comentários em detalhe e usar os resumos só como guia, porque o LLM pode errar. — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- Anúncio de produto (afirmação do fornecedor): resumos por tema para feedback positivo, negativo e neutro em cada pergunta, além de comparação entre grupos demográficos de melhor e pior desempenho. — [Culture Amp product update](https://updates.cultureamp.com/141966-unlock-deeper-insights-with-ai-comment-summaries-in-central-surveys)

**Qualtrics Text iQ**
- O Text iQ marca respostas por tópicos, permite buscas (query builder) que marcam automaticamente novas respostas e faz análise de sentimento. "Recommended Topics" e "Sentiment Analysis" são só do tier Advanced. Português está entre os idiomas suportados. — [Qualtrics Support, Text iQ Functionality](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/text-iq/text-iq-functionality/); [Qualtrics Support, Text iQ (EX)](https://qualtrics.com/support/employee-experience/creating-ee-project/data-tab/text-analysis-ee)

**Workday Peakon, Lattice, Leapsome**
- Peakon: os comentários aparecem exatamente como foram escritos, sem nome ou informação identificadora do respondente (resumo de busca da documentação). — [Workday Peakon docs, FAQ](https://doc.workday.com/peakon/en-us/workday-peakon-employee-voice/surveys/answering-surveys/faq--are-my-answers-confidential-.html)
- Peakon: a página de comentários menciona "Export AI Summaries" e tradução de comentários, mas não detalha a classificação. — [Workday Peakon docs, comments](https://doc.workday.com/peakon/en-us/workday-peakon-employee-voice/general/confidentiality-and-data-visibility/xfm1653911227785.html)
- Leapsome (marketing): a IA transforma respostas abertas em temas ordenáveis por sentimento, filtráveis por time/local, e sugere ações. — [Leapsome blog, Leapsome AI](https://www.leapsome.com/blog/leapsome-ai)
- Lattice: o limiar de anonimato vale para escores **e** comentários (ver seção 6). Não achei documentação de temas/sentimento por IA na página consultada. — [Lattice Help](https://help.lattice.com/hc/en-us/articles/360061212133)

### Inferências (recomendações para o CONFIARA)
- **Sentimento tem pouco valor para estas duas perguntas.** Q1 é conceitual e Q2 pede ação, então quase tudo seria "neutro/propositivo". O que importa é o tema, e para Q1 vale também um eixo "adesão / ceticismo / confusão". Sugiro não exibir sentimento automático. Se houver, que seja marcação humana de "tom" (apoia / cético / resistente) só na Q1.
- **Taxonomia fixa e curada** (estilo Glint, LLM restrito a classificar numa lista aprovada) é mais segura e comparável entre ciclos que temas livres gerados por IA. Se a pesquisa for repetida, manter o codebook estável e versionado. O próprio Glint avisa que trocar o mapeamento quebra a comparabilidade.
- **Português:** os fornecedores traduzem para o inglês e perdem nuance. Se o CONFIARA usar LLM, deve processar direto em português e pedir que a saída cite o trecho original como evidência.

### Gaps
- Não consegui confirmar na documentação oficial como o Peakon e o Lattice categorizam e mostram sentimento dos comentários. Só há material de marketing ou resumos de busca.
- Não há dado público de acurácia dos classificadores dos fornecedores para comentários em português.

---

## 3. Resumo de comentários por IA/LLM: riscos (alucinação, reidentificação, viés) e boas práticas

### Takeaway
LLMs codificam respostas abertas com acurácia próxima à de codificadores humanos quando recebem categorias definidas. Resumos livres, porém, podem distorcer, omitir minorias ou expor nomes. Além disso, LLMs conseguem inferir atributos pessoais (gênero, local, renda) a partir de texto "anônimo". O padrão dos fornecedores é: limiar mínimo de comentários para resumir, amostragem proporcional, taxonomia fechada, comentários representativos ligados ao resumo, aviso de que a IA pode errar e validação humana.

### Cited Findings
- Mellon et al. (2024) testaram 6 LLMs com few-shot, 3 classificadores supervisionados e um segundo codificador humano para classificar respostas "most important issue" do British Election Study em 50 categorias. O melhor LLM (Claude-1.3) teve 93,9% de acurácia, contra 94,7% do humano e 93,5% do melhor modelo supervisionado. Em texto novo com dados já codificados: LLM 80,9%, humano 88,6%, supervisionado 77,8%. — [Mellon et al., Research & Politics 2024 (Cardiff ORCA)](https://orca.cardiff.ac.uk/id/eprint/177688/)
- Há estudo sobre codificação por LLM de respostas abertas em alemão, ou seja, fora do inglês. — [von der Heyde et al., Survey Research Methods 2025](https://ojs.ub.uni-konstanz.de/srm/article/view/8568/7787)
- Benchmark FaithBench (resumos com anotação de especialistas): até os melhores detectores de alucinação ficam perto de 50% de acurácia. Detectar alucinação automaticamente ainda não é confiável. — [FaithBench, arXiv 2410.13210](https://arxiv.org/abs/2410.13210v1)
- Staab et al. (ICLR 2024): LLMs inferem atributos pessoais (localização, renda, sexo etc.) de textos reais com até cerca de 85% de acurácia top-1 e cerca de 95% top-3, a um custo muito menor que o de humanos. Anonimizar o texto e alinhar o modelo não foram mitigações eficazes. — [Staab et al., "Beyond Memorization", arXiv 2310.07298](https://arxiv.org/abs/2310.07298v2)
- Copilot no Viva Glint:
  - Resume até 10 tópicos principais.
  - Exclui tópicos cujos respondentes ficam abaixo do limiar de confidencialidade.
  - Usa amostragem estratificada por tópico, na mesma proporção da população, sem amostrar por dado demográfico.
  - Limite de 8.000 comentários.
  - Não usa dados do cliente para treinar o modelo.
  — [Microsoft Learn, Copilot in Viva Glint FAQ](https://learn.microsoft.com/en-us/viva/glint/setup/copilot-faqs)
- A Microsoft registra que qualquer IA pode errar ao representar a informação. O Copilot do Glint não detecta vieses entre comentários em idiomas diferentes e não considera resultados quantitativos. A sumarização respeita o limiar configurado no painel ou relatório. — [Microsoft Learn, Copilot FAQ](https://learn.microsoft.com/en-us/viva/glint/setup/copilot-faqs)
- Se o usuário pede um filtro demográfico ao qual não tem acesso, o Copilot do Glint resume **todos** os comentários sem aquele filtro. É um controle de acesso no nível do prompt. — [Microsoft Learn, Copilot FAQ](https://learn.microsoft.com/en-us/viva/glint/setup/copilot-faqs)
- Culture Amp:
  - Exige pelo menos 5 comentários significativos para resumir.
  - Mostra comentários representativos junto do resumo.
  - Admite que nomes podem aparecer nos resumos.
  - Não resume texto "Other".
  - Recomenda usar os resumos só como guia.
  — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- A ANPD, no estudo preliminar sobre anonimização, recomenda que o processo não seja totalmente automatizado e que um especialista humano verifique a eficácia (resumo de escritório de advocacia). Vale como analogia para validação humana de saídas de IA sobre dados de titulares. — [Mayer Brown, resumo do Estudo Preliminar ANPD (fev/2024)](https://www.mayerbrown.com/pt/insights/publications/2024/02/anonymization-and-pseudonymization-anpd-kicks-off-public-consultation-on-preliminary-study)

### Inferências (recomendações para o CONFIARA)
- **IA como sugestão, nunca como relatório final.** Fluxo recomendado:
  1. Um LLM sugere a classificação de cada resposta (já redigida) dentro do codebook fechado (seção 1), com justificativa curta e o trecho que embasa.
  2. Um humano aceita ou corrige cada classificação.
  3. A interface mostra "classificação sugerida por IA, revisada por [papel] em [data]".
  Resumos em prosa, se houver, ficam limitados a 2 ou 3 frases por tema e sempre ligados às respostas de origem, para o leitor clicar e conferir.
- **Limiares para IA:** só gerar resumo de um tema ou pergunta com pelo menos 5 respostas significativas (padrão Culture Amp), e nunca resumir o "Outro (especifique)".
- **Proibições no prompt e no produto:** não inferir nem mencionar características de autores (gênero, raça, idade, área, senioridade), não citar nomes, não especular sobre quem escreveu. Bloquear perguntas livres do tipo "quem escreveu isto?". Os resultados de Staab et al. mostram que o modelo **consegue** inferir atributos, então o risco é real em escritório pequeno.
- **Viés de omissão:** pedir ao modelo que liste explicitamente as visões minoritárias ou divergentes, e que um humano confira se nenhum tema com 1 ou 2 menções relevantes (por exemplo, relato de discriminação) foi engolido pelo resumo.
- **Não usar IA para decisões sobre pessoas.** Copiar a ressalva do Glint: temas não servem para avaliar, promover ou punir.
- **LGPD/contrato:** enviar comentários a um LLM de terceiro é compartilhamento com operador. É preciso cláusula de não treinamento e checagem de transferência internacional (ver seção 7).

### Gaps
- Não achei estudo publicado que meça a taxa de alucinação de LLMs ao resumir respostas abertas reais de pesquisas de clima ou D&I validadas por humanos, nem em português.
- O resultado de Mellon et al. é de 2024 com modelos antigos (Claude-1.3). A acurácia de modelos atuais em português não foi medida nas fontes encontradas.

---

## 4. Nuvens de palavras: evidências contra e alternativas melhores

### Takeaway
A evidência empírica e a opinião de especialistas em visualização convergem: nuvens de palavras transmitem mal a frequência, tiram as palavras do contexto e dão só uma análise rasa. A alternativa recomendada é codificar em temas e mostrar um gráfico de barras com contagem por tema, mais citações de exemplo por tema ("tema + evidência"). Mapas de calor com citações e comparações entre grupos também servem.

### Cited Findings
- Estudo controlado com 234 participantes: tanto a escala por tamanho de fonte quanto a escala por área da palavra levaram a desempenho ruim e grande variação entre participantes ao estimar frequências. Os autores concluem que nuvens são uma medida "volúvel" (*fickle*) de frequência. — [Maurits, Boers & Knevel, IVAPP/VISIGRAPP 2022](https://www.scitepress.org/Papers/2022/107787/)
- Críticas recorrentes:
  - É difícil ordenar as palavras (qual é a 2ª, a 3ª?).
  - Palavras longas parecem mais importantes com a mesma frequência.
  - O contexto se perde.
  - Muitas vezes aparecem só obviedades.
  — [Relative Insight](https://relativeinsight.com/?p=114143); [UC Berkeley iSchool](https://www.ischool.berkeley.edu/node/10348)
- Jacob Harris (NiemanLab), em resumo da BetterEvaluation: nuvens de palavras só sustentam a análise textual mais rudimentar, são usadas onde análise textual nem é adequada e deixam o leitor deduzir o contexto sozinho. — [BetterEvaluation](https://betterevaluation.org/node/1796)
- Usuários de ferramentas de nuvem costumam manipular o tamanho para deixar a visualização "bonita", o que distorce a leitura. — [UC Berkeley iSchool](https://www.ischool.berkeley.edu/node/10348)
- Stephanie Evergreen trata a nuvem como o default batido e propõe alternativas: nuvens comparativas em pares, *heat tables* (respostas classificadas numa escala de cor com citações de exemplo do que cada cor representa) e o *Qualitative Chart Chooser* (com Jennifer Lyons). — [Khulisa, #EvalTuesdayTip (Evergreen)](https://www.khulisa.com/?p=8890); [DASY Center, qualitative data visualization](https://dasycenter.org/?p=10138)
- Existe ainda um texto crítico no blog de Evergreen ("Word Cloud Dog Vomit, An Illustrated Rant"). Não consegui abrir a página (HTTP 403), então cito só o título. — [stephanieevergreen.com](https://stephanieevergreen.com/word-cloud-dog-vomit/)
- A nuvem é rápida e barata frente à codificação, mas perde o significado de respostas longas. Codificar em temas e mostrar categoria, número e % em barras é a opção mais rigorosa (fontes de mercado). — [Drive Research](https://driveresearch.com/?p=2913); [Alida, pros and cons of word clouds](https://alida.com/the-alida-journal/pros-and-cons-word-clouds-visualizations)
- Contraponto: o próprio Viva Glint oferece "cloud view" de palavras-chave e tópicos, mas sempre com alternativa em tabela, cor por sentimento e clique levando aos comentários. Ou seja, a nuvem é usada como porta de entrada para os textos e não como conclusão. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- Melhoria proposta por um autor de Berkeley: nuvem clicável que leva ao texto, ou um conjunto curado de palavras comparado entre textos. — [UC Berkeley iSchool](https://www.ischool.berkeley.edu/node/10348)

### Inferências (recomendações para o CONFIARA)
- **Não usar nuvem de palavras no relatório do comitê.** Em português o problema piora por causa da flexão ("inclusão/incluir/inclusivo/inclusiva", "diversidade/diverso") e das negações ("não há inclusão"), que a nuvem destrói. Na Q2, a nuvem mostraria "treinamento", "diversidade" e "escritório", que é óbvio e não acionável.
- **Padrão de visual recomendado, cartão "Tema → Evidência":**
  1. Barras horizontais ordenadas por número de pessoas que mencionaram cada tema, com o denominador visível ("das 42 pessoas que responderam a esta pergunta").
  2. Ao clicar ou expandir um tema, 1 a 3 citações redigidas, mais um link "ver todas as N respostas deste tema".
  3. Um bloco "Outros / menções pontuais".
  4. Na Q1, opcionalmente uma *heat table* simples com o tom (apoio/neutro/ceticismo) e uma citação por célula, no estilo Evergreen.
- Se o produto já tem nuvem, ela pode ficar como visão exploratória secundária: lematizada, sem stopwords em português, clicável até as respostas e nunca como gráfico principal.

### Gaps
- O estudo empírico (Maurits et al.) mede leitura de frequência e não a qualidade de decisão de comitês. Não achei estudo que compare decisões tomadas com nuvem versus barras de temas em contexto de RH.
- Não encontrei páginas atuais da Datawrapper ou da Storytelling with Data especificamente sobre nuvens. A busca não retornou material delas.

---

## 5. Como apresentar citações: representatividade, cherry-picking, redação de detalhes identificadores, ordem aleatória, mínimos

### Takeaway
Citação é evidência e não argumento. A seleção deve refletir os padrões fortes, distribuir-se entre respondentes diferentes, sinalizar quando algo é exceção e passar por checagem de identificabilidade. Para dados de pesquisa, a boa prática é resumir e controlar o acesso ao texto livre, substituir detalhes identificadores por marcadores entre colchetes (e não apagá-los) e manter um registro das edições. Os fornecedores mostram 3 a 5 comentários representativos por tema ou pergunta.

### Cited Findings
- Lingard (2019) recomenda:
  - Tratar a citação como **evidência, não argumento**, e explicitar o ponto que ela ilustra.
  - Ser sucinto (cortes com reticências sem mudar o sentido, colchetes para ajustes).
  - Garantir representatividade: refletir padrões fortes e distribuir entre participantes em vez de repetir os mais articulados.
  - Incluir visões discrepantes só de forma deliberada.
  - Dar contexto e proteger a confidencialidade, checando se a citação somada a detalhes do cenário identifica alguém.
  - Muitas vezes, uma citação basta.
  — [Lingard, Perspectives on Medical Education 2019 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6904374/)
- Outras práticas de mercado: julgar representatividade pelo número de pessoas que disseram algo e pela variedade de tipos de participantes; rotular outliers como exceção e não como prova; registrar contracitações e o quanto cada visão é comum (fontes comerciais). — [GoTranscript, quote selection rules](https://gotranscript.com/en/blog/interview-quote-selection-rules)
- Culture Amp: 3 comentários representativos com menos de 20 comentários e 5 com mais de 20. — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- Glint: os "Representative Comments" isolam uma lista curta que representa os temas, de modo que "ler alguns" dá a noção do todo. — [Microsoft Learn, Comments report](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)
- ONS (carta do National Statistician, 24/08/2022), sobre a pesquisa de clima do serviço público britânico:
  - Resumir o texto livre e controlar o acesso a ele protege respondentes que fornecem informação capaz de identificá-los ou identificar outras pessoas.
  - Isso pesa especialmente quando a pesquisa vira canal para assuntos que exigem tratamento cuidadoso, como salvaguarda.
  - A boa prática é ter uma política de salvaguarda que defina quando a privacidade deve ser quebrada para proteger pessoas.
  — [ONS/UKSA, carta a PACAC sobre o People Survey](https://uksa.statisticsauthority.gov.uk/wp-content/uploads/2022/10/240822-Letter-from-Sir-Ian-Diamond-ONS-to-William-Wragg-MP-PACAC-People-Survey.pdf)
- Texto verbatim tem mais chance de conter detalhes identificadores. Por isso, a política da Lehigh University restringe os dados abertos brutos a pesquisadores qualificados e deixa circular apenas trechos revisados. — [Lehigh University, Survey Data Confidentiality and Sharing Statement](https://data.lehigh.edu/survey-data-confidentiality-and-sharing-statement)
- UK Data Service:
  - Dados qualitativos trazem combinações de identificadores indiretos que elevam o risco de revelação.
  - Planejar as edições cedo e manter consistência.
  - Usar substituições entre [colchetes] ou pseudônimos em vez de apagar trechos.
  - Manter um registro de anonimização separado.
  - Controlar o acesso costuma ser melhor que anonimizar demais.
  — [UK Data Service, Anonymising qualitative data](https://ukdataservice.ac.uk/?p=3657); [UKDS workshop slides 2023](https://ukdataservice.ac.uk/app/uploads/howtoanonymisequalandquantdata2023-10-19.pdf)
- Glint: redação de PII com "#####", quarentena de comentários sensíveis (só admins veem) e categoria "ambiente de trabalho sensível" (discriminação, assédio, bullying). — [Microsoft Learn, Flag sensitive comments](https://learn.microsoft.com/en-us/viva/glint/setup/glint-sensitive-comments)

### Inferências (recomendações para o CONFIARA)
- **Passada de curadoria antes do comitê, feita por um papel com permissão de "dados sensíveis" fora do comitê:**
  1. Substituir nomes, cargos únicos ("a única sócia da área X"), clientes, processos, cidades ou unidades, datas de eventos e descrições pessoais singulares por marcadores: [nome], [cargo], [área], [cliente], [evento]. Não usar "#####" sem rótulo, porque o marcador preserva o sentido para o comitê.
  2. Manter um log das edições, visível só ao curador.
  3. Pôr em quarentena textos que relatem assédio ou discriminação concretos. Eles vão para o fluxo do canal de denúncia do CONFIARA, com política escrita de quando e como agir, como recomenda o ONS. Avisar no início da pesquisa: "para denúncias, use o canal de denúncia; não inclua nomes ou detalhes que identifiquem você ou outras pessoas."
- **Regras de seleção de citações:**
  - Por tema, 1 a 3 citações. Preferir as que expressam a ideia típica do tema, e não as mais eloquentes.
  - Nunca usar mais de uma citação da mesma resposta no relatório.
  - Se uma visão minoritária for destacada, rotular como "menção pontual".
  - Disponibilizar a lista completa redigida em anexo, o que neutraliza a acusação de cherry-picking.
  - Registrar quem selecionou as citações.
- **Ordem aleatória:** manter o embaralhamento e refazê-lo a cada carregamento ou exportação, sem ordem cronológica. Mostrar Q1 e Q2 em listas **separadas e embaralhadas de forma independente**, para não reconstruir o "perfil" de um respondente (o que ele entende mais o que pede), o que somaria identificadores indiretos (UKDS).
- **Mínimos para citações:** só exibir citações literais de uma pergunta se pelo menos N pessoas tiverem respondido àquela pergunta específica. Ver o N recomendado na seção 6.

### Gaps
- Não encontrei norma ou guia brasileiro (ANPD ou MTE) sobre como apresentar citações de pesquisas internas de trabalhadores.

---

## 6. Limiares mínimos de grupo (anonimato) usados por fornecedores e órgãos estatísticos

### Takeaway
O padrão de mercado para **escores** é 5 respondentes (Glint, Lattice, Qualtrics no onboarding), com piso configurável de 3 ou 4. A Gallup usa 4 por padrão em parte da documentação. Para **comentários**, vários fornecedores são mais rígidos: o Glint usa 10 respondentes por padrão, tanto para liberar comentários na pesquisa quanto por grupo. A Culture Amp conta pessoas e não comentários, e permite elevar o mínimo de comentários. Órgãos estatísticos usam limiares de célula de 3 a 10 e reconhecem que não há consenso (por exemplo, o ONS fala em "<5 ou <10").

### Cited Findings
- **Viva Glint (padrões):**
  - Escores ("Rated Confidentiality"): 5, ajustável para 3 ou 4.
  - "Suppression": 2. O próximo menor grupo é suprimido para impedir o cálculo por subtração.
  - Taxa de resposta: 5.
  - "Comments Search": **10 respostas (não comentários)** na pesquisa antes de os comentários ficarem visíveis.
  - "Comments Confidentiality": **10** por grupo filtrado.
  - Os limiares não podem mudar depois que a pesquisa coleta dados, e RH, Privacidade e Jurídico podem opinar.
  — [Microsoft Learn, Manage Viva Glint confidentiality thresholds](https://learn.microsoft.com/en-us/viva/glint/setup/manage-confidentiality-thresholds)
- Treinamento do Glint: ver comentários exige pelo menos 10 respostas na pesquisa inteira (resumo de busca). — [Microsoft Learn training, Viva Glint confidentiality](https://learn.microsoft.com/en-us/training/modules/viva-glint-navigate-viva-glint-results/1-describe-confidentiality-navigate-viva-glint)
- **Culture Amp:**
  - O "reporting group minimum" é definido por pesquisa, e os exemplos usam 5.
  - O "comments group minimum" conta **pessoas** que responderam, não comentários. A maioria iguala ao mínimo geral e algumas empresas o elevam.
  - As configurações não mudam após o lançamento e aparecem para o respondente na tela de boas-vindas.
  — [Culture Amp, Confidentiality protections in reporting](https://support.cultureamp.com/en/articles/7048386-confidentiality-protections-in-reporting)
- **Lattice:** de 3 a 10, padrão 5, vale para escores e comentários. Limiar de 3 ou 4 pode deixar participantes vulneráveis e menos honestos. — [Lattice Help](https://help.lattice.com/hc/en-us/articles/360061212133)
- **Qualtrics EX:** pelo guia de onboarding, começa-se por padrão com limiar de anonimato e limiar de comentários iguais a 5 (resumo de busca de página antiga). Os comentários seguem a configuração "Minimum responses to display comments". — [Qualtrics, Step 4: Reporting](https://qualtrics.com/support/employee-experience/getting-started-employee-experience/employee-engagement-onboarding/step-4-reporting-employee-engagement-project-results); [Qualtrics, Confidentiality (EX dashboards)](https://qualtrics.com/support/employee-experience/creating-ee-project/dashboards-tab/dashboard-management/dashboard-settings/anonymity-ee/)
- **Workday Peakon:**
  - Mínimo configurável de 3 respondentes para escores agregados (resumo de busca).
  - Comentários têm limiar de segmento e limiar de resposta por rodada, numa janela de 1 ano. Exemplo: limiar de segmento 6 e de resposta 3.
  - Há também um limiar de "funcionários únicos entre segmentos" contra dedução.
  — [Peakon docs, comments thresholds](https://doc.workday.com/peakon/en-us/workday-peakon-employee-voice/general/confidentiality-and-data-visibility/xfm1653911227785.html); [Peakon docs, confidentiality](https://doc.workday.com/peakon/en-us/workday-peakon-employee-voice/general/confidentiality-and-data-visibility/kyw1653644699757.html)
- **Gallup:** sem relatório de grupo abaixo de **4** respondentes (padrão, que o admin pode aumentar). Outra página de ajuda fala em menos de 6, ou seja, a documentação é inconsistente. Há supressão também por pergunta (resumo de busca; uma página deu 403). — [Gallup Support, Why don't I have data in my report](https://support.gallup.com/hc/en-us/articles/40874805840787-Why-don-t-I-have-data-in-my-report)
- **Leapsome:** limiar por pesquisa **e por pergunta**. Perguntas não obrigatórias puladas podem fazer uma pergunta cair abaixo do limiar e ficar oculta. — [Leapsome Help, Working with an Anonymity Threshold](https://help.leapsome.com/hc/en-us/articles/7652069033757-Working-with-an-Anonymity-Threshold)
- **Órgãos estatísticos:**
  - A regra de frequência mínima suprime células com poucos respondentes, tipicamente cerca de 3. O Reino Unido usa 5 em estatísticas empresariais.
  - A supressão secundária evita recalcular a célula a partir dos totais.
  - Um manual de estatística citando a Eurostat fala em 5 a 10 unidades por célula em tabelas de frequência.
  — [UN Statistics wiki, Statistical confidentiality](https://millenniumindicators.un.org/wiki/spaces/M2CG/pages/5310451/C.3.+Statistical+confidentiality); [Eurostat wiki, Confidentiality of tabular data](https://wikis.ec.europa.eu/spaces/IFS/pages/152797579/9.1.2+Confidentiality+of+tabular+data)
- ONS: não recomenda análise cruzada com números baixos numa categoria e registra em nota que a orientação diverge entre <5 e <10. — [ONS/UKSA carta 2022](https://uksa.statisticsauthority.gov.uk/wp-content/uploads/2022/10/240822-Letter-from-Sir-Ian-Diamond-ONS-to-William-Wragg-MP-PACAC-People-Survey.pdf)

### Inferências (recomendações para o CONFIARA)
- **Limiares distintos por tipo de dado**, todos travados no lançamento e exibidos na tela inicial da pesquisa (padrão Culture Amp/Glint):
  - Perguntas fechadas: n ≥ 5 respondentes **daquela pergunta** (mantém a regra atual, mas contando por pergunta e não pela pesquisa).
  - Textos abertos (Q1 e Q2): exibir o conjunto de respostas só com **n ≥ 10 respondentes na pesquisa e n ≥ 5 respostas não vazias àquela pergunta**. Com 20 a 150 respondentes isso quase nunca bloqueia, mas protege o caso de 6 a 9 pessoas num escritório pequeno, onde o texto livre é muito mais identificador que um escore.
  - Contagens por tema: mostrar números exatos só a partir de 3 menções. Abaixo disso, "menções pontuais" (ver seção 1).
  - "Outro (especifique)": não exibir verbatim por padrão (ver seção 7).
- **Contar pessoas e não comentários**, e contar respostas válidas por pergunta, incluindo ramificações (lição do Leapsome e do Qualtrics "enhanced", que conta vazios).
- **Permitir só subir o limiar, nunca descer depois do lançamento.** Mostrar ao respondente o valor vigente.

### Gaps
- Nenhuma fonte oficial justifica empiricamente por que 5 e não 3 ou 10. São convenções de mercado e de órgãos estatísticos, sem consenso (o próprio ONS registra a divergência).
- A documentação oficial da Gallup com o limiar exato não pôde ser lida por inteiro (HTTP 403), e os números vêm de resumos de busca.

---

## 7. Riscos específicos: filtros e cruzamentos, ataques de diferença, ramificações com n pequeno, metadados de data e hora, "Outro (especifique)", texto livre

### Takeaway
Os vetores de reidentificação vão além do "grupo < 5". Há a diferença entre dois recortes ou dois momentos, a combinação de filtros, perguntas ramificadas respondidas por poucos, metadados (data e hora, ordem), exportações e o próprio conteúdo do texto (detalhes únicos, estilo). Os fornecedores respondem com supressão secundária ("next smallest group"), limite de um filtro em comentários, campos de data tratados como sensíveis, regras iguais em exportações e reconhecimento explícito de que nenhuma proteção cobre todos os cenários.

### Cited Findings
- **Diferença ou triangulação:**
  - Culture Amp oferece proteção contra identificação indireta em três níveis: "None", "Basic" (padrão recomendado: se um filtro inclui um grupo de 1 pessoa, o próximo menor grupo é ocultado) e "Strong" (qualquer grupo abaixo do mínimo oculta o próximo menor).
  - Em relatórios por líder, respostas podem ser removidas "para prevenir triangulação".
  — [Culture Amp, Confidentiality protections](https://support.cultureamp.com/en/articles/7048386-confidentiality-protections-in-reporting)
- Glint: o limiar "Suppression" esconde o próximo maior grupo até que a soma de insuficientes e suprimidos alcance o limiar, para impedir "adivinhar por matemática simples". — [Microsoft Learn, thresholds](https://learn.microsoft.com/en-us/viva/glint/setup/manage-confidentiality-thresholds)
- **Filtros em comentários:**
  - A Culture Amp limita comentários a **um** filtro demográfico por padrão "para proteger o anonimato". Comentários verbatim são únicos e podem ser rastreados por eliminação ("demographic triangulation").
  - Com múltiplos filtros, a exportação exclui as colunas demográficas, e grupos abaixo do mínimo saem como "n/a".
  — [Culture Amp, Set up a filter for the comments report](https://support.cultureamp.com/en/articles/7048606-set-up-a-filter-for-the-comments-report)
- Culture Amp não permite filtro com grupo abaixo do mínimo nem quando a combinação total atingiria o mínimo (resumo de busca). — [Culture Amp, Report filters](https://support.cultureamp.com/en/articles/7048607-report-filters)
- **Qualtrics EX:**
  - Todos os campos de **metadados** são "extremamente sensíveis" por padrão.
  - "Somewhat sensitive" é indicado para **datas e períodos**: valores abaixo do limiar ficam ocultos.
  - A confidencialidade "enhanced" conta respostas vazias.
  - A Qualtrics admite que a proteção "não protege contra todos os cenários de cálculo indireto" com múltiplos filtros ou breakouts.
  — [Qualtrics, Confidentiality (EX dashboards)](https://qualtrics.com/support/employee-experience/creating-ee-project/dashboards-tab/dashboard-management/dashboard-settings/anonymity-ee/)
- Peakon: limiar por rodada (um número mínimo de respostas na rodada), além do limiar do segmento na janela de 1 ano. Comentários só aparecem onde o segmento não conflita com outro. Recomenda informar os empregados de como a confidencialidade dos comentários está configurada. — [Peakon docs](https://doc.workday.com/peakon/en-us/workday-peakon-employee-voice/general/confidentiality-and-data-visibility/xfm1653911227785.html)
- **Ramificação:** no Leapsome, uma pergunta pode cair abaixo do limiar quando parte das pessoas a pula, e então é ocultada. O limiar vale por pergunta. — [Leapsome Help](https://help.leapsome.com/hc/en-us/articles/7652069033757-Working-with-an-Anonymity-Threshold)
- **"Other" texts:** a Culture Amp não resume o texto "Other" de múltipla escolha. — [Culture Amp Support](https://support.cultureamp.com/en/articles/7048585-emerging-themes-in-comments)
- **Texto livre:**
  - Exige resumo e controle de acesso (ONS).
  - O verbatim tem maior probabilidade de conter detalhes identificadores (Lehigh).
  - Dados qualitativos trazem combinações de identificadores indiretos (UKDS).
  — [ONS/UKSA carta 2022](https://uksa.statisticsauthority.gov.uk/wp-content/uploads/2022/10/240822-Letter-from-Sir-Ian-Diamond-ONS-to-William-Wragg-MP-PACAC-People-Survey.pdf); [Lehigh](https://data.lehigh.edu/survey-data-confidentiality-and-sharing-statement); [UKDS](https://ukdataservice.ac.uk/?p=3657)
- **Inferência por IA:** LLMs inferem atributos pessoais a partir de texto, e anonimizar o texto não foi mitigação eficaz no estudo. — [Staab et al., ICLR 2024](https://arxiv.org/abs/2310.07298v2)
- **Abordagens formais:** pesquisa do grupo de Gary King (Harvard) argumenta que desidentificação e auditoria de consultas falham contra reidentificação intencional, e propõe privacidade diferencial (resumo de busca; não li o texto completo). — [King et al., dpsurveyr (Harvard)](https://gking.harvard.edu/files/dpsurveyr.pdf)
- **ONS, medidas combinadas para pesquisas de clima:**
  - Desidentificação e agrupamento (faixas em vez de valores exatos).
  - Identificadores em vez de nomes.
  - **Convite aberto** em vez de convite com código individual.
  - **Segregação de funções**, em que analistas não acessam identificadores e usuários da análise só veem agregados.
  - Controle estatístico de divulgação (suprimir números pequenos).
  - Avaliação de impacto à privacidade.
  — [ONS/UKSA carta 2022](https://uksa.statisticsauthority.gov.uk/wp-content/uploads/2022/10/240822-Letter-from-Sir-Ian-Diamond-ONS-to-William-Wragg-MP-PACAC-People-Survey.pdf)

### Inferências (regras de supressão recomendadas para o CONFIARA)
1. **Sem resultados parciais ao vivo.** Abrir resultados só após o encerramento, ou atualizar em lotes (por exemplo, diariamente e só com pelo menos 5 respostas novas). Um painel que muda de n=7 para n=8 logo depois de alguém dizer "acabei de responder" permite atribuir a nova resposta àquela pessoa. É o mesmo raciocínio do "differencing", aplicado no tempo. Essa regra é inferência minha a partir da lógica de supressão secundária dos fornecedores, que não trazem a regra literalmente.
2. **Nada de data e hora por resposta** na interface ou nas exportações para o cliente. No máximo, total de respostas por dia, e só depois do encerramento e com n ≥ 5 por dia (tratar data como "somewhat sensitive", como faz a Qualtrics). Não guardar IP nem user-agent junto da resposta.
3. **Ramificações:** o limiar se aplica ao n de quem **viu e respondeu** a pergunta derivada. Se só 4 pessoas responderam a um follow-up, ocultar a pergunta inteira, inclusive a contagem "4 pessoas responderam". A própria existência de um n pequeno revela que poucas pessoas marcaram a opção que abre o ramo, o que pode ser sensível (por exemplo, "sofri discriminação → descreva").
4. **"Outro (especifique)":**
   - Não exibir o verbatim por padrão.
   - O curador recodifica cada texto em uma opção existente ou numa categoria agregada nova, que só aparece com pelo menos 3 menções.
   - Os demais viram "Outros (n)".
   - Se o comitê precisar ler, mostrar só após redação e só se a pergunta tiver n ≥ 5 respondentes.
   Em D&I, o "Outro" costuma ser autodescrição de identidade (gênero, orientação, etnia, deficiência), ao mesmo tempo **dado pessoal sensível** e altamente singular num escritório pequeno.
5. **Não cruzar nem vincular respostas:** sem filtros por resposta de outra pergunta ("mostre a Q2 de quem marcou X na pergunta 3"), sem mostrar Q1 e Q2 do mesmo respondente lado a lado, sem ID de resposta visível. Se no futuro houver filtros, limitar comentários a 1 filtro e aplicar supressão do próximo menor grupo (Culture Amp "Basic" e Glint "Suppression").
6. **Exportações (PDF/CSV) com as mesmas regras do painel**: textos redigidos, ordem embaralhada, sem metadados.
7. **Redação e quarentena antes da exibição** (seção 5), com papel separado (segregação de funções, ONS). O comitê vê só a versão curada, e o bruto fica restrito ao curador.
8. **Convite aberto ou link único da pesquisa**, sem tokens individuais ligados a e-mail (ONS). Se o CONFIARA usar tokens para evitar respostas duplicadas, desvincular o token da resposta no momento do envio (ver seção 8 sobre pseudonimização).
9. **Repetições da pesquisa:** não permitir comparar "antes e depois das últimas X respostas" nem reabrir uma pesquisa fechada para "mais algumas respostas" sem reiniciar o ciclo de supressão.
10. **Transparência ao respondente:** na tela inicial, informar os limiares, que os textos são lidos de forma agregada e redigidos, e que não se deve incluir nomes. Para denúncias, indicar o canal (Peakon e Culture Amp mostram as configurações ao respondente).

### Gaps
- Não encontrei guia oficial (ONS, Eurostat, Census) específico sobre controle de divulgação de **texto livre** em pesquisas de clima além da carta do ONS. As fontes tratam sobretudo de tabelas.
- Não encontrei documentação de fornecedor que trate explicitamente da regra "não mostrar resultados parciais em tempo real". A recomendação 1 é inferência.
- Não li o artigo de King et al. por inteiro.

---

## 8. Contexto jurídico brasileiro: LGPD (Lei 13.709/2018), anonimização vs. pseudonimização, orientação da ANPD

### Takeaway
Pela LGPD, dado anonimizado não é dado pessoal, **salvo** se a anonimização puder ser revertida com meios próprios ou com esforços razoáveis (art. 12). A razoabilidade se mede por custo, tempo e tecnologia disponível. Dado pseudonimizado, ou seja, reidentificável com informação mantida pelo controlador, continua sendo dado pessoal. A ANPD trata a anonimização como **processo contínuo baseado em risco, documentado e com verificação humana**, e prevê métricas como k-anonimato. O guia, porém, só chegou à fase de consulta pública (2024): não encontrei versão final publicada. Nas respostas abertas de D&I, a pessoa pode revelar dados **sensíveis** (origem racial, vida sexual, religião, saúde/deficiência). Enquanto for possível identificá-la, vale o regime do art. 11.

### Cited Findings
- Definições (art. 5º):
  - I, dado pessoal: informação relacionada a pessoa natural identificada ou identificável.
  - II, dado pessoal sensível: inclui origem racial ou étnica, convicção religiosa, opinião política, dado referente à saúde ou à vida sexual etc.
  - III, dado anonimizado: relativo a titular que não possa ser identificado, considerando meios técnicos razoáveis e disponíveis na ocasião do tratamento.
  - XI, anonimização: uso de meios técnicos razoáveis e disponíveis pelos quais o dado perde a possibilidade de associação, direta ou indireta, a um indivíduo.
  — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- Art. 12:
  - Caput: dados anonimizados não são dados pessoais para os fins da lei, salvo quando a anonimização for revertida com meios próprios ou puder ser revertida com esforços razoáveis.
  - §1º: a razoabilidade considera fatores objetivos como custo e tempo de reversão, as tecnologias disponíveis e o uso exclusivo de meios próprios.
  - §2º: podem ser considerados dados pessoais os dados usados para formar o perfil comportamental de pessoa identificada.
  - §3º: a ANPD pode dispor sobre padrões e técnicas de anonimização.
  — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- Art. 13, §4º: pseudonimização é o tratamento pelo qual o dado perde a possibilidade de associação, direta ou indireta, a um indivíduo, senão pelo uso de informação adicional mantida separadamente pelo controlador em ambiente controlado e seguro. A definição aparece no artigo sobre estudos em saúde pública ("para os efeitos deste artigo"), mas é usada como referência geral. — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- Outros dispositivos:
  - Art. 6º, III (necessidade): limitar o tratamento ao mínimo necessário.
  - Art. 11 e §1º: o regime de dados sensíveis vale para qualquer tratamento que **revele** dados sensíveis.
  - Art. 16, IV: dados podem ser conservados para uso exclusivo do controlador, sem acesso de terceiros, se anonimizados.
  - Art. 46: obrigação de medidas de segurança técnicas e administrativas.
  — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **ANPD, documento oficial:** a Nota Técnica nº 6/2024/CGN/ANPD (processo SEI 00261.001476/2023-91) analisa as contribuições da consulta interna e propõe submeter à sociedade a minuta do "Guia Orientativo – Anonimização e Pseudonimização para a proteção de dados pessoais" como Estudo Preliminar, por 30 dias na plataforma Participa + Brasil. Segundo a nota:
  - A minuta tem 4 apêndices, entre eles um caderno de técnicas de anonimização e pseudonimização para **dados textuais estruturados** e técnicas de mensuração de risco como a **k-anonimização**.
  - Anonimização e pseudonimização se diferenciam principalmente pela possibilidade de o controlador reverter o processo com meios próprios e informações adicionais sob seu controle.
  — [ANPD, Nota Técnica nº 6/2024/CGN/ANPD (gov.br)](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes/ts-01-2024-nota-tenica-6-de-abertura.pdf/@@display-file/file)
- Consulta à sociedade sobre o Estudo Preliminar: aberta em 30/01/2024, prazo final citado como 28/02/2024 e prorrogado (fontes citam 14/03 e 03/04/2024). Participa + Brasil registra 51 contribuições (resumo de busca). — [Participa + Brasil, Consulta – Estudo Preliminar Anonimização e pseudonimização](https://www.gov.br/participamaisbrasil/consulta-a-sociedade-estudo-preliminar-anonimizacao-e-pseudonimizacao-para-protecao-de-dados); [Mattos Filho](https://www.mattosfilho.com.br/unico/anonimizacao-pseudonimizacao-direitos-titulares/)
- Conteúdo do Estudo Preliminar (resumo da Mayer Brown, fev/2024):
  - O maior risco é a reidentificação após a anonimização. O risco não precisa ser zero, mas deve ser razoável, considerando contexto, natureza e origem dos dados e tecnologia.
  - Contam os meios próprios do agente e os esforços razoáveis de terceiros (custo, tempo, estado da técnica).
  - Se o agente puder reverter com meios próprios, trata-se apenas de pseudonimização.
  - A avaliação de risco deve ser **documentada** e pode ser pedida pela ANPD em fiscalização.
  - A anonimização exige base legal (art. 7º ou 11) e finalidade compatível.
  - Recomenda-se não automatizar totalmente e prever verificação por especialista humano.
  - Técnicas citadas: supressão, generalização, mascaramento, ruído, permutação; para pseudonimização, substituição, hash e criptografia.
  — [Mayer Brown (pt)](https://www.mayerbrown.com/pt/insights/publications/2024/02/anonymization-and-pseudonymization-anpd-kicks-off-public-consultation-on-preliminary-study)
- Os materiais da consulta definem identificadores indiretos ("quase-identificadores"): inócuos isoladamente, mas capazes de identificar quando combinados com dados auxiliares (resumo de busca). — [Mattos Filho](https://www.mattosfilho.com.br/unico/anonimizacao-pseudonimizacao-direitos-titulares/)
- Um núcleo acadêmico (UFRGS) registra que a ANPD ainda não detalhou critérios de probabilidade de reidentificação e aponta como referência os critérios de matriz europeia: singularização, ligação e inferência. — [UFRGS Pró-Privacidade, Anonimização](https://www.ufrgs.br/proprivacidade/anonimizacao)

### Inferências (recomendações para o CONFIARA)
- **Não prometer "anônimo = fora da LGPD" sem ressalva.** Num escritório com 20 a 150 pessoas, o texto livre pode tornar alguém identificável por "esforços razoáveis" de colegas e gestores, que têm contexto (art. 12, §1º). O enquadramento mais seguro tem três camadas:
  - (a) Respostas brutas abertas e "Outro" = **dado pessoal, potencialmente sensível**, com acesso restrito (curador/DPO), retenção definida e segurança (art. 46).
  - (b) Relatório ao comitê (temas, contagens, citações redigidas, supressões) = saída **anonimizada por desenho**, sustentada por uma avaliação de risco de reidentificação **documentada** (exigência apontada no estudo da ANPD). Pode ser uma página no RIPD/registro do controlador.
  - (c) Se houver qualquer token ou e-mail que permita ao CONFIARA ou ao cliente religar resposta e pessoa, os dados são **pseudonimizados** e continuam sendo dados pessoais (art. 13, §4º; Estudo Preliminar).
- **Minimização (art. 6º, III) já é ponto forte:** não coletar demografia nem área. Manter assim, e não reintroduzir data e hora fina, IP ou ordem de resposta.
- **Base legal e finalidade:** a pesquisa de D&I e o plano de ação são a finalidade declarada. Usar as respostas para outro fim (por exemplo, avaliar pessoas) seria incompatível. Isso casa com a ressalva do Glint de não usar temas em decisões de emprego.
- **IA de terceiros:** enviar respostas brutas a um LLM externo é tratamento por operador e, se o provedor estiver fora do Brasil, **transferência internacional** (Capítulo V da LGPD). Preferir enviar só texto já redigido, com contrato de não retenção e não treinamento. Verificar a regulamentação da ANPD sobre transferência internacional (não pesquisada aqui).
- **Linguagem para o termo de privacidade e a tela inicial:** "Respostas anônimas: não coletamos nome, e-mail, área ou dados demográficos. Textos livres são lidos de forma agregada, após remoção de nomes e detalhes identificadores, e só aparecem com pelo menos N respostas. Não inclua informações que identifiquem você ou terceiros. Para relatos de assédio ou discriminação, use o canal de denúncia."

### Gaps
- **Não encontrei a versão final do Guia de Anonimização e Pseudonimização da ANPD.** Só a fase de consulta (2024) está documentada nas fontes encontradas, e a criação do PDF da Nota Técnica 6 em 11/12/2025 não comprova publicação final. Vale checar diretamente gov.br/anpd.
- O caderno de técnicas da minuta trata de **dados textuais estruturados**. Não encontrei orientação da ANPD sobre anonimização de **texto livre**.
- Não encontrei guia da ANPD específico sobre dados de trabalhadores ou pesquisas internas de clima/D&I. Uma postagem secundária (LinkedIn) atribui ao Guia de Legítimo Interesse (fev/2024) a posição de que empregados estão em posição vulnerável, mas não verifiquei na fonte oficial, então não registrei como achado.
- Não pesquisei a Resolução da ANPD sobre transferência internacional nem os artigos específicos (33 a 36 e 38) da LGPD. Ficam como pontos a confirmar com o jurídico.
