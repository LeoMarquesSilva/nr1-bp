# Visualização de resultados de perguntas fechadas (Likert, frequência, sim/não, múltipla escolha) para um comitê de D&I não técnico

Notas de pesquisa para o painel de resultados da pesquisa interna de D&I do CONFIARA (12 perguntas: 7 Likert 1–5 com "prefiro não responder", 1 de frequência negativa, 1 sim/não com ramificação, 1 múltipla escolha "até 3 de 8 + Outro", 2 abertas; 20–150 respondentes; resultados ocultos abaixo de 5; sem segmentação). Painel atual: Likert em barras divergentes centradas no 3 com média e % discorda/% concorda; múltipla escolha em barras horizontais ordenadas por contagem.

Convenção: "Cited Findings" = fato atribuído a fonte com URL. "Inferences" = recomendação/derivação minha a partir das fontes, incluindo specs implementáveis para o CONFIARA. Cálculos numéricos (margens de erro) estão em Inferences e mostram a fórmula usada.

---

## 1. Likert: qual gráfico usar (divergente vs 100% empilhado vs % favorável vs média), onde fica o neutro, como ordenar e como tratar "prefiro não responder"

### Takeaway
Não há consenso entre as referências: Robbins & Heiberger defendem a barra empilhada divergente como exibição principal, enquanto a Datawrapper (Muth & Aisch, 2018) e outros preferem a barra 100% empilhada, e várias fontes rejeitam dividir o neutro ao meio. Para um comitê leigo, o caminho mais defensável é: barra de distribuição completa (5 categorias, neutro em cinza e visível) + número-manchete "% favorável" (concordo + concordo totalmente), itens ordenados por % favorável, média rebaixada ou removida, e "prefiro não responder" fora da base mas exibido como contagem à parte.

### Cited Findings
**Barras divergentes (pró)**
- Heiberger & Robbins recomendam barras empilhadas divergentes como técnica gráfica *principal* para escalas Likert e afins, e discutem questões perceptivas e de programação na construção — [Heiberger & Robbins, Journal of Statistical Software 57(5), 2014](https://www.jstatsoft.org/article/view/v057i05)
- No artigo JSM de 2011, Robbins & Heiberger revisam tabelas, barras de médias, barras agrupadas, barras divididas, "ribbon charts", múltiplas pizzas, waffles, radar e barras divergentes, e preferem as divergentes: concordância à direita de uma linha zero, discordância à esquerda, neutro dividido ao meio numa cor neutra; em escalas com número par de opções, não há neutro — [Robbins & Heiberger, "Plotting Likert and Other Rating Scales" (PDF, Montana State Univ.)](https://www.montana.edu/msse/Old_Data_analysis/Likert%20Survey%20Graphs.pdf) (conteúdo obtido via resumo de busca; o PDF veio binário e não pôde ser lido integralmente)
- Propriedades listadas para um bom gráfico Likert: centrado em 0 com linha de referência em 0, paleta padrão acessível a quem tem deficiência de visão de cores, ordenação opcional pelo lado direito (concordância) — [Heiberger & Robbins, JSM 2012 "Design of Plots for Likert and Other Rating Scales" (PDF)](https://ww2.amstat.org/meetings/proceedings/2012/data/assets/pdf/305235_74490.pdf) (via resumo de busca)
- A documentação do pacote R HH (função `likert`) desenha a linha de referência *atrás* das barras para que o grupo neutro não pareça artificialmente dividido — [HH likert, R documentation](https://search.r-project.org/CRAN/refmans/HH/html/likert.html) (via resumo de busca)
- Pirrone (Nightingale/DVS, 2020, atualizado 2021) testou 7 formatos com os mesmos dados (pizzas múltiplas, barras agrupadas, small multiples de barras, waffles, número grande + texto, barra empilhada, barra divergente) e recomendou fortemente a barra divergente por separar positivo e negativo com uma linha-base central espessa; ressalvas: a posição do neutro é decisão subjetiva e o formato pode confundir parte do público. Ela tratou o neutro como negativo (a linha central vira uma "meta") — [Pirrone, "Visualizing Likert Scale Data: Same Data, Displayed Seven Different Ways", Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)
- Na mesma comparação, pizzas foram consideradas difíceis de ler (ângulo/área) e barras agrupadas "assustadoras"/lentas de processar; small multiples de barras com valores rotulados diretamente foram o formato favorito pessoal da autora — [Pirrone, Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)

**Barras 100% empilhadas (pró) e crítica às divergentes**
- Muth & Aisch (Datawrapper, 6/mar/2018) não recomendam barras divergentes para percentuais e preferem barras 100% empilhadas, sobretudo quando comparar as categorias extremas importa. Argumentos: as divergentes perdem a leitura imediata de "parte de um todo"; desperdiçam largura (crítico em telas de celular, uma barra longa espreme as demais); dificultam rotular segmentos pequenos; com neutro dividido não existe linha-base comum; e não há como saber se metade do neutro "é positiva" — [Datawrapper, "The case against diverging stacked bars"](https://www.datawrapper.de/blog/divergingbars)
- A mesma fonte: o neutro deve aparecer (pode ficar acinzentado, mas não pode sumir), citando a máxima de Philip Meyer de que "não sei" também é dado; e recomenda um segundo eixo/total visível para a soma de concordância, já que esse é o ponto fraco da barra 100% — [Datawrapper](https://www.datawrapper.de/blog/divergingbars)
- A Datawrapper não cita estudo com leitores; a argumentação é baseada em premissas e em Few (2016), Robbins & Heiberger e comentaristas — [Datawrapper](https://www.datawrapper.de/blog/divergingbars)
- Layton (R-bloggers, fev/2022) refez três desenhos: (1) divergente com neutro dividido (duvida que o neutro seja meio positivo/meio negativo, logo o zero não é base comum); (2) neutro num painel lateral separado (atribuído a Few, 2016), o que torna o zero uma base comum para comparar concordância total — "gosto deste desenho"; (3) 100% empilhada com neutro no centro e escala secundária no topo — julgada a mais eficaz das três, embora o neutro fique mais difícil de comparar — [Layton, "Survey data chart designs", R-bloggers](https://www.r-bloggers.com/2022/02/survey-data-chart-designs/)
- Domo observa que alguns designers removem o neutro para forçar uma comparação binária concordo/discordo — [Domo, "Divergent Bar Charts"](https://www.domo.com/learn/charts/divergent-bar-charts) (via resumo de busca); isso contraria Datawrapper ("neutros devem aparecer") — [Datawrapper](https://www.datawrapper.de/blog/divergingbars)
- Workshop da Duke (CDVS, 2025) compara três abordagens para Likert: barra 100% empilhada, heatmap de distribuição e "strip plot" com jitter — [Duke CDVS workshop](https://deeptech.duke.edu/event/cdvs-workshop-custom-approaches-visualizing-likert-scale-survey-data-using-ggplot2-10-16-2025/)
- Ann K. Emery (Depict Data Studio) vende um kit de 7 modelos Excel para escalas concordo–discordo, incluindo barra empilhada tradicional, divergente, divergente que destaca os polos e "icon array" — [Depict Data Studio, "Visualizing Survey Results: Crowded Agree-Disagree Scales"](https://depictdatastudio.gumroad.com/l/agree-disagree-scales)

**% favorável / agrupamento em 3 faixas (padrão de plataformas de engajamento)**
- Storytelling with Data (2012) apresenta dados Likert agrupados em favorável / neutro / desfavorável, em ordem decrescente de concordância — [Storytelling with Data, "visualizing survey data"](https://www.storytellingwithdata.com/blog/2012/03/visualizing-survey-data)
- Culture Amp: a visão padrão é o % favorável (concordo + concordo totalmente); neutro e desfavorável aparecem também, muitas vezes no hover. Cores: favorável verde, neutro cinza, desfavorável rosa — [Culture Amp, "How scores are calculated for reports"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports); [Culture Amp, "Admin Guide to Understanding Survey Results"](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)
- Culture Amp: a base de cada pergunta é quem respondeu aquela pergunta (não o total de participantes, pois é possível pular); arredonda para inteiro; o neutro é calculado como 100 − favorável − desfavorável para que os três somem 100% — [Culture Amp, "How scores are calculated for reports"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports)
- Pesquisa de engajamento e diversidade da Prefeitura de Edmonton (2014) reporta % Favorável / % Neutro / % Desfavorável e instrui interpretar o neutro como "levemente negativo", dado o viés positivo do instrumento — [City of Edmonton, 2014 Employee Engagement and Diversity Survey (PDF)](https://www.edmonton.ca/documents/PDF/CommunityServicesDepartment-2014EmployeeEngagementandDiversitySurvey.pdf)

**Média**
- Sullivan & Artino (J. Grad. Med. Educ., 2013): como os números de itens Likert representam respostas ordinais, apresentar uma média com duas casas decimais geralmente não ajuda o leitor — [Sullivan & Artino, "Analyzing and Interpreting Data From Likert-Type Scales", PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3886444)
- Jamieson (Medical Education, 2004) defende que itens Likert são ordinais e pedem estatística não paramétrica; há réplica (Pell) defendendo análise paramétrica de *escalas* (somas de itens). Revisões posteriores atribuem parte do debate à confusão entre "escala Likert" (soma de itens) e "item tipo Likert" isolado — [Sullivan & Artino, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3886444); [Carifio & Perla (PDF, NEU)](https://course.ccs.neu.edu/is4800/ssl/carifio.pdf) (debate resumido via resultados de busca; textos completos não lidos)

**Ordenação**
- Layton ordena linhas por concordância total decrescente e observa que Robbins & Heiberger ordenariam pelo ponto extremo direito — [Layton, R-bloggers](https://www.r-bloggers.com/2022/02/survey-data-chart-designs/)
- Culture Amp permite ordenar perguntas por % favorável (mais alto primeiro, ou inverter para ver as mais baixas) — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)

**"Prefiro não responder" / não resposta**
- Culture Amp exclui da base quem pulou a pergunta — [Culture Amp, "How scores are calculated"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports)
- Pew (Religious Landscape Study 2023-24) informa no topo/nota do gráfico a parcela que não respondeu (ex.: "13% não responderam") e mantém "Sem resposta" como linha explícita na tabela de dados; também avisa que valores podem não somar 100% por arredondamento — [Pew, "Among no answer/don't know"](https://www.pewresearch.org/religious-landscape-study/religiousness/no-answer-do-not-know); [Pew, versão markdown](https://www.pewresearch.org/religious-landscape-study/orientation/i-don-t-know-no-answer/markdown)
- Datawrapper: "não sei" é dado e deve ser mostrado — [Datawrapper](https://www.datawrapper.de/blog/divergingbars)

### Inferences
- **Spec recomendada para os 7 itens Likert (uma linha por item, em "small multiples" alinhados):**
  1. Coluna esquerda: nº da pergunta + rótulo curto (≤ 60 caracteres) com o texto completo em tooltip/expansão.
  2. Centro: barra de distribuição com as 5 categorias. Duas opções igualmente defensáveis pelas fontes:
     - (a) **manter a barra divergente atual**, mas com o neutro **fora do eixo** — num bloco cinza à direita da barra (desenho Few/Layton), para que o zero vire base comum e não se assuma que metade do neutro é positiva; ou
     - (b) **barra 100% empilhada** (Datawrapper/Layton), ordem fixa da esquerda para a direita: Discordo totalmente → Discordo → Neutro (cinza) → Concordo → Concordo totalmente, com o % favorável escrito à direita.
     Para um comitê leigo e responsivo em celular, (b) tende a ser mais simples (todas as barras têm o mesmo comprimento, "parte de um todo" óbvia, sem desperdício de largura); (a) é melhor se a mensagem principal for "positivo vs negativo". Se mantiver a divergente centrada no 3 (Robbins), desenhar a linha zero atrás das barras (HH).
  3. Coluna direita (números): **% favorável em destaque** (fonte maior, cor do polo favorável), depois % desfavorável e % neutro menores; **n válido** ("n = 37"). Neutro = 100 − fav − desfav (regra Culture Amp) para fechar 100%.
  4. Rodapé da linha, em cinza: "3 pessoas preferiram não responder (não entram nos %)". Assim segue-se Culture Amp (fora da base) e Datawrapper/Pew (o dado é exibido).
- **Média:** retirar do destaque. Se o produto quiser manter, exibir com **1 casa decimal**, em texto secundário/tooltip, nunca como métrica principal nem com cor de semáforo (Sullivan & Artino; Jamieson). Não há fonte que mostre comitês interpretando bem médias de 1–5; o % favorável é a métrica que plataformas de mercado (Culture Amp, Edmonton) usam como manchete.
- **Neutro:** manter visível e cinza. Para o texto interpretativo do comitê, uma frase do tipo "neutro alto pode indicar desconforto ou desconhecimento" se apoia na leitura de Edmonton (neutro como levemente negativo); evitar somá-lo a qualquer lado nos números.
- **Ordenação:** padrão = **% favorável decrescente** (Culture Amp, Layton, Robbins opcional), mantendo o nº da pergunta visível para referência cruzada; oferecer alternância "ordem do questionário". Com apenas 7 itens, a ordenação torna o melhor e o pior item visíveis sem esforço.
- **Rótulos nos segmentos:** escrever o % dentro de cada segmento só quando houver largura (ex.: ≥ 8–10% da barra); segmentos menores ficam sem rótulo e o valor vai para tooltip/legenda tabular (Datawrapper aponta a dificuldade de rotular segmentos pequenos). Usar inteiros, sem casas decimais.
- **Legenda:** uma única legenda no topo do bloco, com as 5 categorias na mesma ordem espacial das barras, ou rótulos diretos acima da primeira barra (Pirrone: rotular diretamente em vez de depender de legenda).

### Gaps
- Não encontrei estudo empírico com leitores comparando divergente vs 100% empilhada; a Datawrapper declara não ter evidência experimental e as demais fontes são opinião de especialistas.
- O texto completo de Robbins & Heiberger (JSM 2011 e JSS 2014) não pôde ser lido (PDF binário/sem Python disponível); detalhes como exibição de contagens no eixo direito não foram verificados.
- Posts específicos de Stephanie Evergreen (evergreendata.com) e conteúdo gratuito de Ann K. Emery sobre Likert não apareceram nas buscas; só o produto pago de Emery foi localizado.
- O ensaio original de Stephen Few (2016) sobre neutro em painel separado não foi recuperado; a posição dele aparece apenas de forma secundária (Layton, Datawrapper).

---

## 2. Itens de frequência / formulação negativa ("presenciei comentários discriminatórios": nunca → frequentemente)

### Takeaway
Nenhuma fonte encontrada trata especificamente da cor de itens de frequência negativa em painéis de D&I; a prática geral é "reverse scoring" (inverter o sentido para alinhar com os demais itens). A recomendação é manter o mesmo significado de cor e de lado do gráfico em todo o painel: "bom" sempre na mesma cor e no mesmo lado, mesmo que isso inverta a ordem natural das palavras.

### Cited Findings
- "Reverse scoring" é inverter o valor da resposta em itens formulados no sentido oposto para que fiquem alinhados com os demais itens do mesmo construto; itens negativos precisam ser invertidos antes de calcular totais — [Wake Forest Univ., "Reverse scoring" (doc)](https://furrrm.sites.wfu.edu/wp-content/uploads/2018/09/Reverse-scoring.doc); [1cademy, "Reverse coding"](https://1cademy.com/node/reverse-coding/tsDuWHQSaEGzS6bZdzvS) (via resumos de busca)
- Há literatura argumentando que respostas a itens negativos não são simplesmente o espelho dos positivos e que itens invertidos tendem a reduzir a confiabilidade de escalas — [Frontiers in Psychology, 2022](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.828037/full); [Univ. de Oviedo, "Using reversed items in Likert scales: A questionable practice"](https://portalinvestigacion.uniovi.es/documentos/5e57af802999527d991b3930) (via resumos de busca)
- Em escalas com número par de categorias (como nunca/raramente/às vezes/frequentemente), não existe categoria neutra no desenho de Robbins & Heiberger — [Robbins & Heiberger 2011 (PDF)](https://www.montana.edu/msse/Old_Data_analysis/Likert%20Survey%20Graphs.pdf) (via resumo de busca)
- Culture Amp define o "favorável" como a resposta desejável e o exibe sempre na mesma cor (verde), com neutro cinza e desfavorável rosa — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)

### Inferences
- **Mapear cor por significado, não por posição na escala:** "Nunca" recebe a cor do polo favorável (a mesma de "Concordo totalmente"), "Frequentemente" a cor mais forte do polo desfavorável (a mesma de "Discordo totalmente"); "Raramente" e "Às vezes" recebem os tons claro/médio do lado desfavorável. Não usar cinza (não há neutro na escala de 4 pontos).
- **Mesmo lado do gráfico:** se nos Likert o favorável fica à direita, ordenar a barra deste item como Frequentemente → Às vezes → Raramente → Nunca (da esquerda para a direita), para que "bom" continue à direita. Escrever os rótulos das categorias acima da barra, porque a ordem fica "ao contrário" do que o leitor espera.
- **Manchete própria, não "% favorável":** usar um indicador de alerta explícito, por exemplo "**X% presenciaram ao menos raramente**" (= 100% − % Nunca) e, em segundo plano, "Y% com frequência". Para D&I, presenciar discriminação "raramente" ainda é um sinal relevante; tratar só "frequentemente" como ruim esconderia o problema. (Escolha de corte é decisão de produto; documentar no rodapé.)
- **Selo de leitura:** um ícone/etiqueta "Item de alerta — quanto maior, pior" ao lado do título, para o comitê não ler a barra com a lógica dos itens Likert.
- **Não misturar com a média dos Likert:** não incluir este item em qualquer índice médio geral sem inverter, e mesmo invertido é discutível (Frontiers/Oviedo); melhor apresentá-lo em um bloco "Sinais de alerta" separado na visão-resumo.

### Gaps
- Não encontrei documentação pública da Culture Amp, Glint ou Peakon sobre como exibem itens de frequência negativa ou itens invertidos em relatórios (a busca por Viva Glint não retornou documentação).
- Nenhuma fonte de visualização trata do corte "nunca vs. alguma vez" para itens de discriminação; a escolha é inferência.

---

## 3. Sim/não com ramificação (perguntas condicionais): base e percentuais

### Takeaway
A base de cada percentual deve estar escrita no título ou subtítulo do gráfico ("Entre as 40 pessoas que responderam Sim…"), seguindo a convenção do Pew de títulos "Entre [grupo]…" e a regra de base "quem respondeu a pergunta" da Culture Amp; o resultado sim/não em si deve ser um número grande + barra simples, não pizza.

### Cited Findings
- Os gráficos do Pew Religious Landscape Study abrem com o grupo-base no título ("Among [grupo]…") e informam a parcela que não respondeu e a margem de erro do subgrupo (ex.: ±8,2 p.p. para um subgrupo pequeno) — [Pew, "Among no answer/don't know"](https://www.pewresearch.org/religious-landscape-study/religiousness/no-answer-do-not-know); [Pew, "Among by gender"](https://www.pewresearch.org/religious-landscape-study/gender-composition)
- Culture Amp calcula cada pergunta sobre quem respondeu aquela pergunta; para itens que a pessoa nunca viu (por regra de exibição/ramificação), as demais respostas dela continuam contando — [Culture Amp, "How scores are calculated"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports)
- Culture Amp aplica um mínimo de grupo para relatório (exemplo do artigo: 5) e mostra "n/a" para grupos abaixo do mínimo; também bloqueia combinações de filtros que permitiriam identificação por diferença — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)
- Pirrone lista "número grande + texto" como formato que foca a atenção em uma mensagem, com a ressalva de colapsar categorias e perder nuance — [Pirrone, Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)
- Pizzas exigem julgar ângulos/áreas e são difíceis de comparar — [Pirrone, Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)

### Inferences
- **Pergunta-filtro (sim/não):** cartão com número grande "**40 de 112 (36%) responderam Sim**" + uma barra horizontal 100% de duas cores (Sim / Não) + "prefiro não responder" como contagem cinza abaixo, fora da base. Se "Sim" for o sinal negativo (ex.: já sofreu/presenciou algo), usar a cor do polo desfavorável para "Sim", consistente com o item de frequência.
- **Perguntas condicionadas:** agrupar visualmente sob a pergunta-filtro (recuo, linha conectora ou fundo comum) e titular com a base explícita: "**Entre as 40 pessoas que responderam Sim** (36% do total)". Todos os % dessas perguntas usam como base quem viu e respondeu a pergunta condicional (Culture Amp). Opcionalmente, em tooltip, o equivalente sobre o total ("= 12% de todos os respondentes"), para o comitê dimensionar o problema sem confundir bases.
- **Nunca** colocar percentuais das condicionais na mesma escala/coluna que os itens respondidos por todos sem o rótulo de base — é a principal fonte de leitura errada.
- **Anonimato em cascata:** aplicar o limite de 5 também à sub-base: se menos de 5 pessoas responderam "Sim", ocultar as condicionais com aviso ("Resultados ocultos para proteger o anonimato: menos de 5 respostas neste grupo"), mesmo que o total da pesquisa seja ≥ 5. Isso estende a lógica de grupo mínimo/"n/a" da Culture Amp a um subgrupo criado pela ramificação, que na prática funciona como um recorte.
- Quando a sub-base for pequena (5–15), mostrar contagens absolutas ao lado dos % (ver seção 6 sobre amostras pequenas).

### Gaps
- Não encontrei guia de estilo do Pew ou de plataformas de RH que trate especificamente de perguntas com "skip logic" em painéis; as recomendações extrapolam a convenção "Among…" do Pew e a regra de base da Culture Amp.

---

## 4. Múltipla escolha ("escolha até 3 de 8 + Outro")

### Takeaway
Manter barras horizontais ordenadas, mas com % calculado sobre **pessoas que responderam a pergunta** (não sobre o total de marcações), nota explícita de que a soma passa de 100%, contagem absoluta ao lado e "Outro" fixado no fim, com os textos livres acessíveis logo abaixo.

### Cited Findings
- Qualtrics distingue "% de respondentes" (cada opção dividida pelo nº de pessoas; soma > 100% quando se pode marcar várias) de "% de escolhas" (dividido pelo total de marcações; soma 100%); o padrão do relatório é a porcentagem de respondentes, podendo trocar para % de escolhas — [Qualtrics, Global Results-Reports Settings](https://www.qualtrics.com/support/survey-platform/reports-module/results-section/global-results-report-settings/); [Qualtrics Community, "% of choice vs % of response"](https://community.qualtrics.com/survey-platform-54/difference-between-of-choice-and-of-response-19596?postid=45043); [Qualtrics, Simple Table](https://www.qualtrics.com/support/survey-platform/reports-module/results-section/visualizations/tables/simple-table/)
- SurveyMonkey: em perguntas de caixa de seleção, o total de opções marcadas pode exceder o nº de respondentes, fazendo os percentuais somarem mais de 100% — [SurveyMonkey Help, "Percents not totaling"](https://help.surveymonkey.com/en/surveymonkey/analyze/percents-not-totaling/)
- Google Surveys: somar percentuais de perguntas de múltiplas respostas conta duas vezes quem marcou mais de uma opção; recomenda cuidado/uso de contagens — [Google Surveys Help, "Percentages and overlap"](https://support.google.com/surveys/answer/2998498?hl=ar)
- Relatório da Wikimedia usa a nota "Participantes podiam selecionar mais de uma opção" sob esses gráficos, explicando que o % é de pessoas por opção e por isso costuma somar mais de 100% — [Wikimedia, Community Insights 2016-17, "How to interpret the data"](https://meta.wikimedia.org/wiki/Community_Insights/2016-17_Report/How_to_interpret_the_data)
- Pew omite categorias genéricas de alguns perfis e explica o motivo na nota (ex.: "de alguma outra forma" não exibido porque as pessoas a escolhem por razões variadas) — [Pew, Religious Landscape Study](https://www.pewresearch.org/religious-landscape-study/religiousness/no-answer-do-not-know) (via resumo de busca)
- Culture Amp categoriza comentários livres automaticamente por tema e sentimento, permitindo edição manual, e alerta para erros com sarcasmo/ironia — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)

### Inferences
- **Métrica:** % de respondentes da pergunta (base = pessoas que marcaram ao menos uma opção). Rótulo da barra: "**18 pessoas · 45%**". Não oferecer pizza nem barra empilhada (as partes não somam um todo).
- **Texto obrigatório no subtítulo:** "Cada pessoa pôde escolher até 3 temas; por isso os percentuais somam mais de 100%." Opcional: "Em média, cada pessoa escolheu 2,4 temas" (total de marcações ÷ respondentes).
- **Ordenação:** decrescente por contagem; **"Outro" sempre por último**, independentemente da contagem (é uma categoria residual e heterogênea, na linha do tratamento do Pew para "outra forma"); desempates em ordem alfabética ou na ordem do questionário.
- **Escala do eixo:** 0 a 100% (ou ao maior valor arredondado), para não exagerar diferenças; barras numa única cor neutra/da marca — não há polo bom/ruim aqui, então não usar a paleta divergente.
- **"Outro" com texto:** abaixo da barra "Outro", um link/expansor "ver 6 respostas escritas" que abre a lista (ou temas agrupados manualmente, com contagem por tema). Cuidado com anonimato: textos livres podem identificar pessoas; aplicar o mesmo limite de 5 e moderação antes de exibir ao comitê.
- **Leitura para o comitê:** destacar os 3 temas mais citados como "prioridades apontadas pelas pessoas" — este é o item mais diretamente ligado ao plano de ação.

### Gaps
- Não encontrei pesquisa empírica sobre como leitores leigos interpretam percentuais que somam mais de 100%; as recomendações vêm de documentação de ferramentas.
- Não encontrei fonte específica sobre a posição de "Outro" (fim fixo vs. ordenado); é convenção inferida.

---

## 5. Visões-resumo para o comitê (scorecard, top/bottom, layout executivo) e comparação entre ciclos (2026 vs 2027)

### Takeaway
Plataformas de mercado resumem a pesquisa com o % favorável por item, listas de "pontos fortes" e "oportunidades" (top/bottom) e deltas em pontos percentuais contra o ciclo anterior. Sem segmentação, o heatmap clássico (grupos × itens) perde sentido; o resumo ideal é um scorecard ordenado + 3 destaques positivos + 3 de atenção + bloco de sinais de alerta, e a comparação entre ciclos deve mostrar diferença em p.p. com faixa de incerteza.

### Cited Findings
- Culture Amp: o relatório-resumo traz "O que vocês fazem bem" e "Suas principais oportunidades"; a aba de perguntas ordena por % favorável; um recurso de foco recomenda as 3 principais perguntas para agir (combinando impacto, favorabilidade absoluta e gap vs benchmark) — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)
- Heatmap da Culture Amp: células com % favorável por grupo demográfico, primeira coluna = empresa geral; células abaixo/acima do geral em vermelho/verde com sombreamento contínuo (1 tom por ponto), com opção de esquema azul/amarelo; grupos abaixo do mínimo aparecem como "n/a" — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)
- Comparação com ciclo anterior na Culture Amp: seletor "Comparado a" (empresa geral / pesquisa anterior / benchmark); mudanças exibidas como diferença em pontos; o artigo não menciona limiar de significância — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)
- Comparação histórica de fatores na Culture Amp exige o mesmo conjunto de perguntas nas duas pesquisas; mudanças de redação podem alterar a intenção da pergunta e invalidar comparação com benchmark — [Culture Amp, "How scores are calculated"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports)
- Pew: a margem de erro da *diferença* entre dois números é maior que a de cada um (no exemplo de duas candidaturas na mesma pesquisa, cerca do dobro); variações pequenas entre pesquisas costumam ser ruído (no exemplo do Pew, uma mudança de 3 pontos tinha margem de ±8 pontos) — [Pew, "Understanding the margin of error in election polls" (2016)](https://www.pewresearch.org/short-reads/2016/09/08/understanding-the-margin-of-error-in-election-polls/)
- Pew: barras de erro (IC 95%) que não se sobrepõem indicam diferença estatisticamente significativa; sobreposição *não* garante ausência de diferença; barras de erro cobrem só erro amostral e subestimam o erro total — [Pew, "Understanding error bars in charts" (2025)](https://www.pewresearch.org/decoded/2025/09/16/understanding-error-bars-in-charts/)
- Pew: o erro real de pesquisas costuma ser maior que o reportado por causa de erros não amostrais (não resposta, mensuração) — [Pew, "Key things to know about election polls" (2020)](https://www.pewresearch.org/short-reads/2020/08/05/key-things-to-know-about-election-polling-in-the-united-states/)
- Pirrone: "número grande + texto" ajuda a quebrar relatórios densos e focar numa mensagem, mas a escolha do destaque é subjetiva e perde nuance — [Pirrone, Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)
- Duke CDVS sugere o "heatmap de distribuição" como alternativa para Likert (itens × categorias de resposta) — [Duke CDVS workshop](https://deeptech.duke.edu/event/cdvs-workshop-custom-approaches-visualizing-likert-scale-survey-data-using-ggplot2-10-16-2025/)

### Inferences
- **Layout de uma tela/slide para reunião (de cima para baixo):**
  1. Faixa de contexto: "112 respostas de 180 convidados (62%) · coletado de 01/09 a 30/09/2026 · resultados anônimos, ocultos abaixo de 5 respostas".
  2. Três números grandes: % favorável médio dos 7 itens (ou mediana), "X% presenciaram discriminação ao menos raramente", "Y% responderam Sim na pergunta-filtro".
  3. **Pontos fortes (até 3)** e **Pontos de atenção (até 3)**: itens com maior e menor % favorável, cada um com rótulo curto + % + mini-barra.
  4. **Sinais de alerta**: item de frequência + pergunta-filtro e suas condicionais (seções 2 e 3).
  5. **Prioridades apontadas pelas pessoas**: top 3 da múltipla escolha.
  6. **Vozes**: 3–5 trechos das abertas, selecionados/moderados, com contagem de temas.
- **Scorecard (substitui o heatmap sem segmentação):** tabela de 7 linhas ordenada por % favorável com colunas: Pergunta | mini-barra de distribuição | % Fav | % Neutro | % Desfav | n | (Δ vs ciclo anterior). Com ciclos múltiplos, um heatmap faz sentido como **itens × ciclos** (células = % favorável), usando paleta sequencial de uma cor e o valor escrito em cada célula.
- **Regra de "top/bottom" honesta:** só chamar um item de "ponto forte"/"de atenção" se ele se distanciar dos demais além do ruído; quando os % favoráveis estão próximos (ex.: dentro de ~10 p.p. com n ≈ 40), escrever "resultados semelhantes entre os itens" em vez de forçar um ranking.
- **Comparação 2026 vs 2027:**
  - Mostrar **diferença em pontos percentuais** ("+8 p.p."), nunca variação relativa ("+15%"), que confunde leitores leigos.
  - Gráfico recomendado por item: "dumbbell"/haltere (dois pontos, 2026 cinza e 2027 colorido, ligados por linha) ou duas barras finas, ordenado pelo valor mais recente; indicador ▲/▼ com sinal e texto, não só cor.
  - Classificar a mudança em três estados com texto: "subiu", "caiu", "estável (dentro da margem)". Para duas amostras independentes, a margem da diferença ≈ √(MoE₁² + MoE₂²) ≈ 1,4 × MoE individual quando os n são parecidos (cálculo meu; o Pew dá a ordem de grandeza). Ex.: n = 40 em cada ciclo → MoE individual ≈ ±15 p.p. → só mudanças acima de ~±22 p.p. seriam claramente distinguíveis de ruído amostral; n = 150 em cada ciclo → ±8 → ~±11 p.p.
  - Só comparar itens com redação idêntica (regra da Culture Amp); se a pergunta mudar, marcar "pergunta alterada — sem comparação".
  - Exibir a taxa de resposta dos dois ciclos lado a lado; uma queda grande de participação muda quem está respondendo.

### Gaps
- Não encontrei documentação pública de Glint/Peakon sobre limiares de "mudança significativa" para exibição de deltas; a Culture Amp mostra deltas em pontos sem limiar documentado no artigo lido.
- Não encontrei fonte que valide empiricamente o "dumbbell" vs barras pareadas para leitores não técnicos; a sugestão é inferência.

---

## 6. Amostras pequenas (20–150), margem de erro e contagens

### Takeaway
Com 20–50 respostas, cada pessoa vale 2–5 pontos percentuais e a margem de erro de um % chega a ±14–22 p.p.; o painel deve sempre mostrar o n, evitar casas decimais, mostrar contagens absolutas junto dos % quando n for pequeno e tratar diferenças pequenas como "semelhantes".

### Cited Findings
- Pew: amostras menores geram barras de erro mais longas (estimativas menos precisas); o Pew comunica a incerteza em linguagem simples como "mais ou menos 3 pontos percentuais" — [Pew, "Understanding error bars in charts"](https://www.pewresearch.org/decoded/2025/09/16/understanding-error-bars-in-charts/)
- Pew reporta margem de erro separada por subgrupo (ex.: ±8,2 p.p. num subgrupo pequeno) — [Pew, Religious Landscape Study](https://www.pewresearch.org/religious-landscape-study/religiousness/no-answer-do-not-know)
- Correção para população finita: a margem de erro é multiplicada por √((N − n)/(N − 1)) quando a amostra é uma fração relevante da população; fontes divergem sobre o limiar (≈5% a 10% da população) — [MetricGate, Survey margin of error](https://metricgate.com/calculator/survey-margin-of-error); [QuestionStar, Principles of Survey Research](https://questionstar.com/principles-of-survey-research/chapter-4/slide-146.html.md); [MetricGate, Survey sample size](https://metricgate.com/docs/survey-sample-size/) (fontes de calculadoras/vendors, não metodologia revisada por pares)
- Sullivan & Artino: média com duas casas decimais não ajuda o leitor em dados ordinais — [Sullivan & Artino, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3886444)
- Culture Amp arredonda os % para inteiros — [Culture Amp, "How scores are calculated"](https://support.cultureamp.com/en/articles/7048593-how-scores-are-calculated-for-reports)

### Inferences
- **Valor de uma pessoa** = 100/n p.p.: n = 20 → 5 p.p.; n = 40 → 2,5 p.p.; n = 150 → 0,7 p.p. Exibir isso em tooltip ("cada resposta = 2,5 p.p.") ajuda o comitê a não superinterpretar diferenças.
- **Margem de erro aproximada (IC 95%, pior caso p = 50%, MoE ≈ 0,98/√n, sem correção de população finita):** n = 20 → ±22 p.p.; n = 30 → ±18; n = 40 → ±15; n = 50 → ±14; n = 100 → ±10; n = 150 → ±8. (Cálculo meu com a fórmula padrão; para p = 80%, n = 20 → ±18.)
- **Com correção para população finita** (pesquisa interna com alta adesão), a margem cai bastante: ex. N = 60 convidados, n = 40 respostas → ±15 × √(20/59) ≈ ±9 p.p.; N = 200, n = 150 → ±8 × √(50/199) ≈ ±4 p.p. Como pesquisas internas convidam todos (censo), parte da literatura de RH trata a incerteza mais como viés de não resposta do que erro amostral; o Pew lembra que o erro total costuma ser maior que o amostral. Recomendação prática: não mostrar "±" numericamente para o comitê; usar regras de linguagem ("diferenças menores que ~10 p.p. devem ser lidas como semelhantes quando há menos de 50 respostas").
- **Exibição por faixa de n:**
  - n < 5: oculto (regra atual).
  - 5 ≤ n < 30: mostrar **contagens como informação principal** ("7 de 18 pessoas") e % secundário; sem decimais; aviso discreto "amostra pequena: interpretar com cautela".
  - n ≥ 30: % principal, contagem em tooltip/rodapé.
- **Arredondamento:** inteiros; ajustar o neutro (ou a maior categoria) para fechar 100% (regra Culture Amp), ou incluir a nota "valores podem não somar 100% por arredondamento" (Pew).
- **Base variável por item** (por causa do "prefiro não responder"): mostrar o n de cada item, não só o n da pesquisa.

### Gaps
- Não encontrei fonte metodológica revisada por pares específica sobre margem de erro em pesquisas internas de censo com 20–150 respondentes; as fontes de correção para população finita são calculadoras de fornecedores.
- Não encontrei limiar publicado por plataformas de RH (Culture Amp, Glint, Peakon) para "aviso de amostra pequena" além do mínimo de anonimato.

---

## 7. Cores e acessibilidade (WCAG, daltonismo, não depender só da cor)

### Takeaway
Usar uma paleta divergente segura para daltonismo (azul/laranja ou roxo/laranja, nunca vermelho/verde puros), neutro cinza, separadores brancos entre segmentos, valores escritos como texto nas barras e legendas textuais; com rótulos e valores em texto, o gráfico deixa de depender do contraste 3:1 entre segmentos segundo o próprio W3C.

### Cited Findings
- WCAG 2.1 SC 1.4.11 (AA): objetos gráficos necessários para entender o conteúdo precisam de contraste ≥ 3:1 com cores adjacentes; em gráficos de pizza, fatias adjacentes precisam ser distinguíveis (o exemplo aprovado adiciona borda escura a uma fatia clara) — [W3C, Understanding SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- Exceção do mesmo critério: quando rótulos *e* valores estão escritos no gráfico, a informação é transmitida por texto e o gráfico é marcado como "não aplicável"; o texto dentro do gráfico continua sujeito ao SC 1.4.3 — [W3C, Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- SC 1.4.1 (Uso de cor): diferenciar apenas por matiz é falha; o exemplo de pizza com rótulo por fatia passa no 1.4.1 — [W3C, Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- Prática recomendada por guias de acessibilidade: combinar cor com outro canal (padrão/textura em barras, rótulos diretos em todos os gráficos) — [Tufts, Digital Accessibility: Data Visualizations](https://it.tufts.edu/guides/digital-accessibility/data-visualizations); [Deque, 1.4.11 Non-Text Contrast](https://dequeuniversity.com/resources/wcag2.1/1.4.11-non-text-contrast) (via resumos de busca)
- RColorBrewer marca as paletas divergentes PuOr (roxo–laranja) e RdBu (vermelho–azul) como seguras para daltonismo — [RColorBrewer reference manual (CRAN)](https://cran.ma.ic.ac.uk/web/packages/RColorBrewer/refman/RColorBrewer.html); [r-statistics.co, R Color Theory](https://r-statistics.co/R-Color-Theory-ggplot2.html)
- Regra geral: evitar paletas que contenham vermelho e verde (ex.: RdYlGn, Spectral) — [SAS Blogs, "Colorblind-safe palettes in SAS"](https://blogs.sas.com/content/iml/?p=42475)
- Robbins & Heiberger defendem paleta padrão acessível a pessoas com deficiência de visão de cores — [Heiberger & Robbins, JSM 2012 (PDF)](https://ww2.amstat.org/meetings/proceedings/2012/data/assets/pdf/305235_74490.pdf)
- Pirrone usou azul para positivo, cinza para neutro e laranja para negativo, e recomenda checar se as cores da marca são suficientemente distintas — [Pirrone, Nightingale](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/)
- Culture Amp usa verde/cinza/rosa e oferece alternância de vermelho/verde para azul/amarelo no heatmap — [Culture Amp, Admin Guide](https://support.cultureamp.com/en/articles/7048601-admin-guide-to-understanding-survey-results)

### Inferences
- **Paleta de 5 classes sugerida (ColorBrewer, verificar em colorbrewer2.org antes de fixar):**
  - PuOr 5: Discordo totalmente `#e66101` · Discordo `#fdb863` · Neutro `#f7f7f7` · Concordo `#b2abd2` · Concordo totalmente `#5e3c99`
  - RdBu 5 (alternativa): `#ca0020` · `#f4a582` · `#f7f7f7` · `#92c5de` · `#0571b0`
  - Recomendação: polo favorável em **azul/roxo**, desfavorável em **laranja** (evita a leitura "vermelho = perigo" que pode soar alarmista num tema sensível como D&I, e evita vermelho/verde).
- **Neutro:** `#f7f7f7` praticamente some sobre fundo branco; trocar por um cinza médio (ex.: `#bdbdbd`) ou manter claro com borda de 1px cinza escuro, para cumprir o espírito do 1.4.11. No modo escuro, redefinir os tokens.
- **Separadores:** 1–2px brancos (ou da cor de fundo) entre segmentos empilhados, para que segmentos de tons próximos (ex.: `#fdb863` vs `#f7f7f7`) sejam distinguíveis.
- **Texto dentro das barras:** escolher cor do texto por segmento (branco sobre tons escuros, quase preto sobre claros) garantindo 4,5:1 (SC 1.4.3 para texto normal; requisito padrão do WCAG, não verificado nesta sessão).
- **Não depender só da cor:** rótulos diretos das categorias, % escritos, ▲/▼ + sinal nos deltas, e a palavra "favorável/desfavorável" nos números-manchete. Oferecer uma **tabela alternativa** (toggle "ver como tabela") com todos os valores — também cobre a exceção do 1.4.11 e ajuda leitores de tela.
- **Mesma semântica em todo o painel:** a cor do polo favorável dos Likert é a mesma de "Nunca" no item de frequência e de "Não" na pergunta-filtro (se "Sim" for o sinal negativo). Barras da múltipla escolha em cor neutra/da marca (sem significado bom/ruim).

### Gaps
- O W3C não trata explicitamente de barras empilhadas; a aplicação do 1.4.11 a segmentos adjacentes é extrapolada do exemplo de pizza.
- Os hexadecimais da ColorBrewer foram citados de memória da paleta pública; a fonte consultada (RColorBrewer) confirma apenas a marcação de segurança para daltonismo, não os códigos — conferir em colorbrewer2.org.
