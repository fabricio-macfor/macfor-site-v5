# Macfor · site institucional (home v5)

Home da Macfor: uma agência full service que transforma micro-momentos em grandes impactos para marcas e negócios.

## Abrir

Baixe o repositório e dê dois cliques em `index.html`. A pasta `assets` precisa ficar ao lado. Não precisa de servidor nem de instalação. Revisado no Chrome.

## O que tem

Oito capítulos em uma página:

1. Abertura e hero, com os 39 cases num anel de cartas em 3D.
2. Capítulo 01, sobre a Macfor.
3. Capítulo 02, case em destaque: Mulheres na Ferrovia (MRS Logística).
4. Capítulo 03, os 39 cases em lista. O clique abre a página do case com filme, números, história e galeria.
5. Capítulo 04, sócios.
6. Capítulo 05, prêmios, com quatro esculturas em 3D que giram ao arrastar. As esculturas são ilustrativas, não os troféus reais.
7. Capítulo 06, cases por setor, com física.
8. Capítulos 07 e 08, clientes e contato.

Cursor próprio, botões magnéticos e hover com movimento nas cartas, linhas e selos. Com "reduzir movimento" ligado no sistema, a página troca as animações por transições simples.

## Estrutura

- `index.html`: a página pronta, com CSS, fontes e dados embutidos.
- `assets/`: imagens, filmes, logos, texturas e scripts (`assets/js/app.js`, `assets/js/vendor.js`, `assets/js/esculturas.js`).
- `_fonte/`: os arquivos de origem.
  - `template.html`: estrutura e textos fixos.
  - `styles.css`: estilos.
  - `app.js`: interações.
  - `vendor.js`: entrada do pacote de bibliotecas (three.js, Matter.js, Lenis).
  - `prep_assets.py`: cases, prêmios, clientes e preparo dos assets.
  - `build.py`: monta o `index.html`.
  - `qa.py`: teste automático no Chromium (Playwright).
  - `gerado/`: imagens-base e malhas 3D das esculturas.

## Editar

Edite os arquivos de `_fonte/`, instale as bibliotecas do `_fonte/package.json` com `npm install` e rode `prep_assets.py` e depois `build.py`. Os dois scripts esperam o material bruto dos cases numa pasta `src_assets/`, que não está neste repositório.

## Conferência

Chromium em 1440x900, 390x844, 1920x1080 e movimento reduzido: zero erro de console e sem rolagem lateral. Não testado em Safari nem em celular de verdade.

## Direitos

Marcas, logos, filmes e peças pertencem à Macfor e aos respectivos clientes. Este repositório não concede licença de uso desse material.
