# Backlog

Atualizado em 30 de julho de 2026.

## Alta prioridade

- [ ] **Atribuir o TBT mobile com um trace reproduzível.** As medições recentes
  registraram 276–294 ms. O número 86 citado anteriormente é uma pontuação de
  Lighthouse, não um baseline de TBT em milissegundos, e não deve ser comparado
  diretamente. Registrar a tarefa longa, o script responsável e a rota antes de
  remover efeitos.
- [ ] **Reproduzir a lentidão abaixo do acervo sem alterar a rolagem global.**
  Medir a transição entre o hero e `ScatteredWorks`, incluindo o ciclo do Lenis,
  listeners de scroll, observers e canvases ativos. A duplicação de scrollbars
  foi uma regressão de uma tentativa anterior, não o problema atual a ser
  “corrigido” com outro contêiner rolável.

## Média prioridade

- [ ] **Auditar contraste por função.** Texto de leitura, metadados e controles
  precisam de contraste adequado; gravuras decorativas podem continuar leves.
  Evitar aumentar globalmente a opacidade e destruir a hierarquia editorial.
- [ ] **Revisar a arquitetura de forma incremental.** Só mover componentes
  quando houver uma fronteira clara e testes para a rota afetada. Não combinar
  reorganização de pastas com investigação de performance ou scroll.
- [ ] **Preservar a Seratonin como ativo de identidade.** Qualquer otimização de
  fontes deve manter `--font-hand` e validar visualmente o wordmark e os títulos
  que dependem dela.
- [ ] **Completar os quatro fatos do Graduation.** Confirmar se `CHECKLIZT` é
  piada com o chiado carioca, número de ícones desenhados/aplicados, tiragem do
  kit e se a impressão em uma cor foi restrição ou escolha. Não preencher por
  inferência.
- [ ] **Confirmar os créditos completos da EBAT.** A página registra o papel de
  Maria como designer da escola, mas não inventa nomes, duração do vínculo ou
  divisão de autoria com outras pessoas. Completar apenas quando houver fonte.
- [ ] **Revisar os demais cases que usam `CaseStudyKit`.** A retirada de fita,
  dobra, sombra e inclinação é um padrão compartilhado aprovado. Conferir se
  painéis e legendas específicas continuam legíveis em cada variante, sem
  reintroduzir papel por página.

## Concluído nesta rodada

- [x] A seleção da home foi alinhada ao núcleo curado: Graduation, EBAT, Cyber
  Marinum, Helvetica: Discórdia e Isadora.
- [x] O case EBAT foi reorganizado em identidade, rotina editorial e SPIW, com
  linguagem concreta, autoria explícita e sem causalidade de impacto inventada.
- [x] O `FlipBook` passou a usar bordas tracejadas, contador editorial e
  controles bilíngues no mesmo padrão visual dos cases.
- [x] O case Graduation passou a explicar decisão, entregáveis e colaboração,
  sem alegação de impacto não medido.
- [x] O cabeçalho dos projetos ganhou uma hierarquia única para resultado,
  pergunta, papel e ficha técnica.
- [x] Fita, dobra, moldura de papel, sombra deslocada e inclinação saíram do
  `CaseStudyKit`; imagens e painéis agora usam o vocabulário digital do site.
- [x] Seções escuras/degradê agora ocupam a largura inteira da viewport.
- [x] Header, atalhos flutuantes e botão de topo invertem contraste de forma
  independente quando cruzam uma seção escura.
- [x] O `HANDOFF.md` corrompido por saída de ferramenta foi substituído por um
  handoff legível com o padrão aprovado.

- [x] `ProjectShell.title` aceita `ReactNode`.
- [x] O modal de `CaseStudyKit` não passa `false` para a propriedade `exit`.
- [x] A segunda imagem de HoloGlam recebeu `alt` válido no lugar de JSX em
  `title`.
- [x] Os `x` decorativos foram removidos das etiquetas do hero; os colchetes
  permanecem como moldura suficiente.

## Restrições para a próxima investigação

- Manter uma única rolagem vertical, pertencente ao documento.
- Não usar `overflow: hidden`, `content-visibility` ou um novo scroll container
  como tentativa inicial de corrigir lentidão.
- Não misturar refatoração estrutural, troca tipográfica e otimização de runtime
  no mesmo lote.
- Comparar produção e local antes de descartar alterações não commitadas.
