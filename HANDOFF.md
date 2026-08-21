# Handoff do portfólio

Atualizado em 30 de julho de 2026.

Este documento registra o padrão aprovado pela Maria para que a próxima sessão
continue o trabalho sem reconstruir a direção visual ou a voz do portfólio.

## Objetivo atual

Os cases `/work/graduation` e `/work/ebat` são as referências para a nova
linguagem das páginas de projeto: editorial e digital, com ASCII e linhas
tracejadas, sem simular folhas soltas, fita adesiva ou colagem de papel.

A home apresenta cinco trabalhos selecionados, nesta ordem:
`graduation · ebat · cyber-marinum · magazine · isadora`. Manter essa lista
sincronizada com `FEATURED_PROJECT_HREFS` em `src/app/page.tsx`; a página
`/work` continua com o núcleo maior de sete projetos.

## Padrão visual aprovado para os cases

- A textura creme global do site continua. O que saiu foi a simulação de
  objetos de papel dentro dos cases.
- `CaseFigure` não usa fita, dobra, moldura clara, sombra deslocada ou rotação.
  A imagem fica limpa; a legenda termina com uma linha tracejada.
- `CasePanel` não usa textura de papel, fita, dobra ou inclinação. É um bloco
  transparente com borda tracejada e rótulo entre colchetes.
- `tc-grid--offset` não desloca mais a segunda imagem. As pranchas seguem o
  grid.
- Legendas novas devem usar `imagem 01` / `image 01`, não `folha` ou `lâmina`.
- Divisores têm um trecho curto na cor do projeto, seguido de uma linha
  tracejada regular. O pequeno losango marca a transição. Não voltar ao texto
  `------` visível em várias linhas concorrentes.
- Todo `CaseSection ink` ocupa `100vw`. O fundo escuro/degradê sangra de ponta
  a ponta, enquanto título, texto e imagens continuam alinhados à largura de
  conteúdo por padding calculado.
- No mobile, a faixa escura recebe espaço superior extra para não colidir com o
  wordmark fixo.

Essas regras vivem em `src/components/CaseStudyKit.tsx` e, portanto, afetam os
cases que usam o kit. Não reintroduzir estilo de papel em páginas individuais.

## Contraste dos menus sobre faixas escuras

`ProjectShell` mede a posição vertical das seções `.tc-section--ink` e atualiza
três atributos no elemento `html`:

- `data-project-ink-header`;
- `data-project-ink-cluster`;
- `data-project-ink-btt`.

O header, o grupo flutuante de atalhos e o botão de voltar ao topo invertem
independentemente quando cada um cruza uma faixa escura. Isso é intencional:
num mesmo viewport, o header pode estar sobre o degradê e os atalhos inferiores
sobre a seção clara seguinte. Não substituir por `mix-blend-mode` global, pois
ele altera as cores do wordmark e não garante contraste dos botões.

## Voz do portfólio

Aplicar estas regras em qualquer copy nova:

1. Não alegar resultado sem medição.
2. Não usar template de case (`How might we`, “o desafio era...”) por hábito.
3. Não empilhar adjetivos abstratos.
4. Não usar autopromoção que diminui outra profissão.
5. Descrever decisão, material, restrição, colaboração e peça entregue.
6. Em projeto coletivo, deixar explícito o tamanho da equipe e não apropriar
   decisão coletiva como individual.

No Graduation, a abertura agora apresenta o ponto de vista local por elementos
concretos: onda do calçadão, Guaravita, joelho de padaria e mergulho antes do
trabalho. O resumo mostra entregáveis (`ícones`, `checklist`, `objetos
impressos`) e o bloco `meu papel` informa que foi design gráfico em equipe de
três.

Na EBAT, a narrativa não chama a identidade apenas de “vibrante” ou
“inovadora”. Ela mostra para que o sistema servia:

- um manual de 22 páginas para outra pessoa conseguir montar peças;
- uma rotina editorial de processo seletivo, módulos e redes sociais;
- um folder, peças de estande e vídeo recap para o São Paulo Innovation Week.

O resumo pode citar cerca de 190 inscrições e 100 aprovados como contexto do
ciclo, mas não deve dizer que a identidade causou esses números. O papel
registrado é “designer da escola: identidade, redes sociais, peças impressas e
campanha audiovisual”. Créditos de outras pessoas continuam pendentes e não
devem ser inferidos.

## Flipbooks

`src/components/FlipBook.tsx` também segue o sistema dos cases. Usar imagem
limpa, borda tracejada, contador `01 / 22` e controles entre colchetes. Os
controles são bilíngues e precisam conservar `aria-label`, estado `disabled` e
suporte a `prefers-reduced-motion`. Não reintroduzir moldura de folha, sombra ou
efeito de livro físico.

## Fatos ainda necessários no Graduation

Não inventar:

- se `CHECKLIZT` com Z é uma piada com o chiado carioca;
- quantos ícones foram desenhados e quantos entraram no kit;
- quantos kits foram produzidos;
- se a impressão em uma cor foi restrição de custo ou escolha gráfica.

## Arquivos centrais desta rodada

- `src/app/work/graduation/page.tsx`
- `src/app/work/ebat/page.tsx`
- `src/content/projectStories.ts`
- `src/i18n/dictionaries.ts`
- `src/components/ProjectShell.tsx`
- `src/components/CaseStudyKit.tsx`
- `src/components/FlipBook.tsx`
- `PAGINA-TRABALHOS.md`

## Validação

Rodar antes de entregar:

```powershell
npx tsc --noEmit
npx eslint src/app/work/graduation/page.tsx src/app/work/ebat/page.tsx src/components/ProjectShell.tsx src/components/CaseStudyKit.tsx src/components/FlipBook.tsx src/content/projectStories.ts src/i18n/dictionaries.ts
npm run build
```

Visualizar localmente `http://localhost:3456/work/graduation` e
`http://localhost:3456/work/ebat`. Conferir pelo menos 390×844 e 1494×780,
inclusive com o header e os atalhos cruzando as faixas escuras. O documento
deve manter uma única rolagem e não pode ter overflow horizontal. Na EBAT,
testar ainda o avanço do flipbook e os controles em português e inglês.

Na rodada de 30/07, TypeScript, o ESLint dos cinco arquivos centrais e a build
de produção passaram. A rota foi conferida em 390×844 e 1494×780, sem overflow
horizontal; o contraste independente do header, dos atalhos e do botão de topo
foi verificado nas faixas escuras.

## Produção

Deploy de 30/07/2026:

- ID: `dpl_AgiiTiVVkqLzTBXaWMgEvPeTi1yX`;
- alias principal: `https://portfolio-nine-lime-73.vercel.app`;
- rota conferida: `/work/graduation`;
- smoke test: HTTP 200 em 390×844 e 1494×780, sem erro de console ou overflow
  horizontal.

## Cuidados com o repositório

O worktree contém mudanças deliberadas de outras rodadas, inclusive conversão
de imagens para WebP e alterações na home. Não usar `git reset --hard`, não
restaurar os JPG/PNG removidos e não tratar o `git status` inteiro como trabalho
desta tarefa.
