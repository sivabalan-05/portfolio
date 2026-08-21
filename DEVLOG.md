# Devlog: ondularis nos destaques e a fita da home

6 de agosto de 2026

A ondularis não aparecia nem na home nem na aba de abertura de `/work`: ela
estava só na aba de arte e tecnologia. Entrou em `FEATURED_PROJECT_HREFS` e em
`CORE_HREFS`, fechando as duas listas — sétimo cartão na home, 09/09 na página
de trabalhos.

A capa dela é o pôster em pé, 1080×1350, e foi isso que expôs o problema da
galeria: cada cartão herdava a proporção da própria capa, então a fita ia de
275px a 495px de altura e as legendas caíam em linhas diferentes, com um vão
morto embaixo dos cartões baixos. Agora a moldura é única — 3:2, com margem
interna e a capa inteira dentro dela, sem corte. Os sete cartões têm a mesma
altura e uma linha de base só.

O arraste também foi refeito. Antes, o encaixe do CSS era `mandatory` o tempo
todo: ao soltar o mouse, o navegador cortava para o cartão mais próximo em um
quadro, sem transição. Agora o arraste guarda a velocidade dos últimos
movimentos, projeta cerca de 210ms de deslize, escolhe o ponto de encaixe mais
próximo dessa projeção e vai até lá com desaceleração — o encaixe do navegador
fica desligado durante o gesto e volta quando a fita já está parada em cima do
ponto, sem puxão. Quem solta com a mão parada não é arremessado: aí vale só o
cartão mais próximo de onde parou. As setas e o teclado passaram a andar um
cartão exato por vez, em vez de uma distância arbitrária.

---

# Devlog: home alinhada à curadoria

30 de julho de 2026

Os cinco destaques da home agora são Graduation, EBAT, Cyber Marinum,
Helvetica: Discórdia e Isadora. A sequência abre com o trabalho gráfico mais
forte e percorre cliente, arte e tecnologia, tipografia e direção de arte. Ela
substitui a seleção anterior, que destacava três projetos fora do núcleo curado
da página de trabalhos.

A capa da oficina de TouchDesigner também passou do cartaz institucional para
uma fotografia do resultado de vídeo mapping sobre o busto. O recorte preserva
cabeça e base, usa a mesma proporção da capa anterior e foi convertido para
WebP, reduzindo o arquivo para cerca de 77 KB.

---

# Devlog: EBAT no mesmo sistema editorial

30 de julho de 2026

O case da EBAT foi refeito a partir do padrão aprovado no Graduation. A página
agora explica três problemas concretos — tornar a identidade ensinável, manter
um sistema capaz de publicar toda semana e apresentar a escola no São Paulo
Innovation Week sem parecer uma startup genérica — em vez de empilhar adjetivos
sobre a marca.

A autoria também ficou mais precisa: Maria aparece como designer da escola,
responsável por identidade, redes sociais, peças impressas e campanha
audiovisual. O texto registra apenas números sustentados pelo material do case:
manual de 22 páginas e um ciclo de cerca de 190 inscrições e 100 aprovados. A
copy não atribui causalidade entre identidade e inscrições.

Visualmente, as peças saíram de molduras, fitas e inclinações. Os dois capítulos
azuis ocupam a viewport inteira; o conteúdo permanece no grid e o menu inverte
o contraste enquanto cruza essas faixas. O manual, os carrosséis e as peças do
SPIW usam imagens limpas, legendas tracejadas e índices `imagem` / `image`.

O `FlipBook` compartilhado foi atualizado para o mesmo vocabulário: borda
tracejada, contador técnico e controles bilíngues entre colchetes. A interação
mantém botões acessíveis e respeita `prefers-reduced-motion`.

---

# Devlog: Graduation sem simulação de papel

30 de julho de 2026

O case da formatura da Apple Academy passou a ser a referência das páginas de
projeto. A revisão começou pela escrita: o texto deixou de vender uma impressão
abstrata de “Rio afetivo” e passou a mostrar as decisões que produziram o kit.
A abertura nomeia a onda do calçadão, o Guaravita, o joelho de padaria e o
mergulho antes do trabalho. O resumo apresenta os entregáveis concretos e o
bloco `meu papel` informa que o design foi feito em equipe de três.

Não foram adicionados números nem resultados de recepção porque eles ainda não
estão documentados. Quatro fatos continuam pendentes: o sentido de `CHECKLIZT`,
a quantidade de ícones, a tiragem e a origem da impressão em uma cor.

## Do papel simulado ao grid digital

As molduras de papel, fitas, dobras, sombras deslocadas e rotações saíram do
`CaseStudyKit`. Elas faziam cada imagem parecer uma folha colada e competiam com
a linguagem que já estava consolidada no restante do site. As imagens agora
entram diretamente no grid, e as legendas usam linhas tracejadas como estrutura.
Painéis viraram blocos transparentes com borda tracejada e rótulos entre
colchetes.

Os divisores do cabeçalho e dos capítulos foram unificados: um trecho curto na
cor do projeto abre uma linha tracejada regular, com um pequeno losango na
transição. O resultado preserva ASCII, repetição e detalhe técnico sem empilhar
várias linhas decorativas.

## Degradê full-bleed e contraste

As seções `ink` agora ocupam `100vw`. O fundo escuro sangra até as bordas da
tela, mas o conteúdo continua alinhado ao mesmo grid por um padding calculado.
No mobile, a faixa recebe espaço superior adicional para não colidir com o
wordmark fixo.

O contraste do menu deixou de depender de uma cor única. `ProjectShell` verifica
se o header, o grupo de atalhos e o botão de topo estão sobre uma faixa escura e
inverte cada controle separadamente. Isso resolve o caso em que o topo da tela
está no degradê e a parte inferior já alcançou a próxima seção clara.

O padrão é compartilhado por todas as páginas que usam `CaseStudyKit`; novas
páginas não devem recriar fita, dobra ou inclinação localmente.

A rodada foi publicada na Vercel como
`dpl_AgiiTiVVkqLzTBXaWMgEvPeTi1yX`. O alias principal foi testado em desktop e
mobile com resposta HTTP 200, sem overflow horizontal ou erros de console.

---

# Devlog: recuperação seletiva após a reversão

27 de julho de 2026

A reversão de segurança recuperou a estabilidade, mas também trouxe de volta os
`x` decorativos nas etiquetas do hero e apagou ajustes visuais que já estavam
aprovados em produção. A recuperação foi seletiva: os `x` saíram, os colchetes
foram preservados, e voltaram apenas o enquadramento responsivo da Kanagawa, a
animação sutil de seus contornos, a onda tipográfica do subtítulo e a composição
editorial validada do título.

O backlog também foi corrigido para separar fatos de hipóteses. A pontuação 86
do Lighthouse não é um baseline de TBT em milissegundos; o duplo scroll foi uma
regressão histórica, não uma justificativa para criar outro contêiner rolável;
e a reorganização arquitetural deixou de ser tratada como solução automática
para um problema de performance ainda não atribuído.

---

# Devlog: costurar o digital

23 de julho de 2026

Hoje o portfólio deixou de apenas parecer impresso e começou a responder como um objeto. A intenção não era encher a página de efeitos, mas criar pequenas sensações de matéria: tinta que reage, papel que muda, etiquetas que afundam, peças que podem ser movidas e uma linha que atravessa o site como se segurasse suas páginas.

## ASCII como matéria

Os desenhos ASCII do topo agora reagem diretamente à proximidade do mouse. Os caracteres se transformam por alguns instantes e voltam ao desenho original, sempre na mesma cor da arte. Não há parallax, cursor de terminal ou glitch: o movimento se aproxima mais de uma impressão imperfeita sendo tocada.

Quando a página fica parada, o desenho também muda lentamente entre gatos, flores, estrelas e borboletas. Testei frases generativas nesse espaço, mas elas deixavam o fundo explicativo demais. Removi os textos e preservei apenas as figuras.

A mesma lógica chegou à assinatura e aos pequenos elementos do header. Letras e caracteres se reorganizam individualmente no hover, sem deslocar a composição.

## Um pequeno ateliê

Criei um conjunto de ferramentas que trata a página como uma mesa de trabalho. É possível alternar entre papel creme, cianotipia e papel vegetal. Cada opção muda tinta, fundo, contraste e textura como uma técnica de impressão, em vez de funcionar como um dark mode convencional.

O modo de carimbo transforma o ponteiro em uma ferramenta e deixa marcas de tinta sobre o papel. A coleção usa kaomojis e ornamentos Unicode fofos, sem etiquetas escritas. Os carimbos comprimem no contato, deixam um pequeno excesso de tinta e secam sobre a superfície.

Adesivos e cartões continuam arrastáveis. Quando a composição fica bagunçada, o comando de reorganizar devolve as peças às posições originais com movimento de mola. Também existe uma camada opcional de microsons no rodapé, sempre desligada por padrão.

## Costura, acervo e navegação

Uma linha costurada percorre verticalmente a página, com furos, desvios e pequenos nós. Os divisores, etiquetas de projeto e o arremate do rodapé repetem essa linguagem. A costura virou um sistema de continuidade, não apenas um ornamento.

Os projetos ganharam etiquetas de espécime, textura de papel e respostas mais físicas ao hover. O acesso aos trabalhos funciona como um pequeno portal: antes de abrir a galeria, ele revela fragmentos de três projetos.

Na minibio, a lista convencional de competências virou uma constelação interativa. A instrução “toque nas estrelas”, o estado selecionado e o fio até a descrição deixam claro que os pontos podem ser explorados.

## O que saiu

Removi as frases inclinadas espalhadas pelo fundo, o cartão secreto com kaomoji e o retângulo dobrável abaixo da minibio. As três ideias eram interessantes isoladamente, mas juntas competiam com o trabalho e deixavam a seção com aparência de protótipo.

Também existia um “modo estranho” secreto. Gostei do que ele fazia — reforçava o ASCII, a costura, os desenhos e o contraste dos adesivos — mas o botão não comunicava sua função. A solução foi eliminar o controle e transformar esses efeitos na aparência padrão do site.

## Performance e acabamento

A primeira versão da reação ASCII criava dezenas de temporizadores e atualizações a cada caractere tocado. Em movimentos rápidos, isso produzia pequenas travadas. Reescrevi a interação para usar um único ciclo de animação do navegador, sem renderizar novamente o desenho inteiro.

Depois da mudança, uma sequência de 160 eventos de hover foi processada em aproximadamente 8 ms. A interação continua visível, mantém a cor original e termina sem deixar caracteres presos. O site também continua respeitando `prefers-reduced-motion`.

Fechei o dia validando ESLint, TypeScript, a navegação no navegador e a build estática das 12 rotas. A principal conclusão desta etapa foi simples: o aspecto tátil não vem de simular objetos reais em todos os lugares. Ele aparece quando cada resposta visual parece ter peso, atrito e intenção.

---

# Devlog: do terminal à colagem editorial

21 de julho de 2026

Nas últimas semanas, reconstruí meu portfólio enquanto ele já estava funcionando. A primeira versão tinha referências digitais que eu gosto, mas começou a parecer uma interface de terminal. Eu queria preservar os caracteres, os pixels e a experimentação sem deixar o site frio ou excessivamente técnico.

A direção que encontrei foi a de uma colagem editorial impressa. O ASCII passou a funcionar como gravura sobre papel. As imagens ganharam camadas deslocadas, pequenas rotações e legendas que encostam nas capas. A composição continua assimétrica, mas cada projeto tem espaço para respirar.

## Tipografia

O sistema tipográfico agora combina três vozes:

- Aeonik nos textos corridos;
- ITC Garamond Condensed Book nos momentos editoriais e serifados;
- OffBit Dot Bold nos números, legendas pequenas e informações dos projetos.

A OffBit fica em negrito e com espaçamento normal em todas as páginas. A ideia é lembrar impressão matricial e bolinhas, sem imitar uma tela de código.

## Projetos e composição

A home apresenta nove trabalhos em uma colagem livre: Isadora Ruppert, Helvetica: Discórdia, Genlab, EBAT, Apple Academy Graduation, Pilotis, China-Rio, HoloGlam e VegCoz.

Cada capa reage ao mouse. A imagem sai do estado pixelado conforme se aproxima e fica nítida no hover. O fundo também recebe um tom ligado ao projeto ativo. Essa mudança de cor acabou sendo uma das interações mais simples e mais importantes do site, porque conecta a composição à identidade de cada trabalho.

Criei ainda um modo “mesa”, mais organizado, para quem prefere percorrer os projetos sem a dispersão da colagem. No mobile, as peças continuam levemente inclinadas para não perder a personalidade.

## ASCII sem cara de terminal

Os ornamentos em Braille e Unicode ocupam áreas vazias como desenhos impressos. Eles aparecem na home, no índice de trabalhos e dentro dos projetos, sempre com baixa opacidade e sem competir com as imagens.

Algumas experiências saíram durante o processo. Removi símbolos que pareciam indicadores de sistema, desenhos repetidos, uma constelação colorida da hero e um easter egg com selos arrastáveis. Cortar essas peças deixou a linguagem mais clara: os caracteres agora decoram e dão ritmo, em vez de sugerirem uma interface fictícia.

O cursor continua sendo a exceção mais divertida. Seu rastro usa estrelas, corações tipográficos e sinais matemáticos em pink, lilás pastel, branco e preto. O limite de partículas é controlado para preservar a fluidez.

## Movimento e acessibilidade

As transições de página lembram uma troca de folha. Capas, camadas de papel e ornamentos se movem em velocidades diferentes, mas as animações mais pesadas só entram quando o elemento está próximo da tela.

O site respeita `prefers-reduced-motion`. Em dispositivos com ponteiro de toque, o cursor customizado é ocultado. Também reduzi efeitos no modo mesa depois de perceber queda de desempenho em composições maiores.

## Limpeza técnica

Durante a revisão, encontrei vídeos soltos, protótipos antigos, backups de sprites, fontes sem uso e componentes que já não pertenciam a nenhuma rota. A limpeza removeu cerca de 175 MB do projeto publicado. A pasta `public` caiu de 234,2 MB para 61,4 MB.

Também retirei 15 componentes antigos e reconstruí o cache local de desenvolvimento. Depois da limpeza, validei as 12 páginas do site e 30 caminhos de arquivos estáticos.

O projeto usa Next.js 16, React 19, Framer Motion e Lenis. As fontes principais são locais, então o desenho tipográfico não depende de quem visita ter os arquivos instalados.

## Publicação

A versão descrita aqui foi publicada no commit [`c7a433d`](https://github.com/marylisita/portfolio/commit/c7a433d) e está disponível em [portfolio-nine-lime-73.vercel.app](https://portfolio-nine-lime-73.vercel.app/).

No próximo ciclo, quero revisar a compressão do vídeo da EBAT e continuar ajustando o equilíbrio entre imagem, ornamento e espaço vazio. O objetivo não é deixar tudo preenchido. É fazer cada vazio parecer intencional.

---

# Devlog: Reversao de Seguranca (Scroll e Fontes)

27 de julho de 2026 (Segunda sessao)

Houve uma tentativa de refatorar os componentes e alterar a logica de IntersectionObserver e idle timers em FeaturedWorks para mitigar um bug de lentidao no scroll. Porem, a refatoracao introduziu quebras graves de interface:
1. O surgimento de duas barras de rolagem (two scrolls).
2. O reset involuntario da opacidade no header ao voltar ao topo.
3. A remocao indevida da fonte Seratonin no titulo principal.

Para preservar a estabilidade da producao, todas as alteracoes foram completamente descartadas via 'git reset --hard'. Os unicos commits e codigos mantidos foram os ja registrados pela intervencao anterior da outra IA.

Adicionalmente, tres erros de tipagem estrita (Type errors) pre-existentes que bloqueavam a build na Vercel foram corrigidos permanentemente para que o deploy da versao restaurada ocorresse com sucesso:
- src/components/ProjectShell.tsx: A prop title passou a aceitar ReactNode.
- src/components/CaseStudyKit.tsx: Foi substituido 'false' por 'undefined' nas propriedades de animacao do Framer Motion.
- src/app/work/hologlam/page.tsx: Foi removida a passagem de JSX para o atributo HTML title em um componente Image.

O codigo em main esta agora 100% igual a versao anterior funcional (sem bugs de fonte ou layout duplicado). O deploy de producao na Vercel foi finalizado.
