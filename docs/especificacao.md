# Kinpital: especificação

Documento vivo: registra o que já foi decidido e o que ainda está em aberto. Atualize a seção certa quando uma
decisão mudar e anote a mudança em [Histórico de decisões](#14-histórico-de-decisões).

Referência visual dos bancos: [`referencias/identidade-dos-bancos.webp`](referencias/identidade-dos-bancos.webp).
O título "KinWallet — Bank Identity System" na imagem vem de quando o projeto inteiro se chamava KinWallet. Hoje esse
nome é só a área dos bancos (ver [3](#3-estrutura-do-app)).

---

## 1. Visão geral

**Kinpital** (trocadilho com *Kapital*) é um app financeiro fictício e realista para o Kindroid: um app dentro do app.
O usuário e os companions (Kins) têm contas em 24 bancos fictícios de 7 regiões, com moedas, juros, cartões,
parcelamentos, empréstimos, dívidas e câmbio. O tempo corre em tempo real: a fatura que vence no dia 10 vence no
dia 10 de verdade.

## 2. Formato: programa do Workshop do Kindroid

O Kinpital segue o mesmo modelo do **Clotheskin** (`Varg67/Clotheskin`, branch `main`):

- **A tela** (`screen/`): a interface dentro do Kindroid. Mostra os dados e é o controle remoto.
- **A execução** (`run`): o motor. Roda por agendamento e por ações da tela, conversa com o Kin por `kin ask`,
  `kin tell` e `kin files`, e grava o estado.
- **Um escritor por arquivo:** a tela grava as escolhas do usuário, e a execução grava o estado financeiro. Assim uma
  nunca sobrescreve a outra (regra herdada do Clotheskin).
- Sem dependências em tempo de execução, como no Clotheskin.

Os detalhes técnicos (arquivos, ações e permissões) serão definidos no plano de implementação.

## 3. Estrutura do app

```
Kinpital  (tema Kindroid)
├── KinWallet: a carteira
│   ├── Saldo total, convertido para uma moeda à escolha
│   ├── Contas em cada banco (ex.: Violeta R$ 2.300 · Revolux € 450)
│   ├── Faturas e parcelas que vencem em breve
│   └── Abrir conta em um dos 24 bancos
│        └── Tela do banco: muda para as cores e o logo dele
├── Imóveis e bens: comprar casa, carro etc., com financiamento pelos bancos
├── Trabalho e renda: salário do usuário e dos Kins, caindo na conta todo mês
├── Bolsa (futuro): depende da decisão sobre dados reais (ver 10)
└── Configurações: Kins anexados, fuso horário, tema
```

## 4. Quem tem conta

- **O usuário** tem conta própria, como um cliente.
- **Qualquer Kin anexado** pode ter conta. "Anexado" = o Kin tem o programa Kinpital anexado no Workshop (o mesmo
  conjunto que o Clotheskin lista com `kin kins`). Kins não anexados não aparecem. *(Interpretação a confirmar:
  ver 13.)*
- Uma pessoa (usuário ou Kin) pode ter conta em mais de um banco.

## 5. Os 24 bancos

14 tradicionais (58,3%) e 10 digitais (41,7%), em 7 regiões. Os nomes são conceituais: paródias sem verificação de
disponibilidade comercial. Algumas inspirações (Wise, Jupiter, Fi Money) são fintechs, não necessariamente bancos
licenciados. No jogo, toda classificação é fictícia.

Cores: **cor 1** = principal (marca), **cor 2** = secundária, **cor 3** = fundo claro. Os valores foram tirados da
imagem de referência.

### 🇧🇷 Brasil (BRL): 4 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Banco Imperial | Tradicional | Banco do Brasil | Banco histórico, crédito rural e financiamento | `#123C66` | `#D8B55B` | `#EDE6D1` |
| Itauba | Tradicional | Itaú Unibanco | Banco privado, investimentos e cartões premium | `#E7642D` | `#F4C39A` | `#FFF3E6` |
| Violeta | Digital | Nubank | Conta gratuita, cartão roxo e crédito digital | `#7446C8` | `#B58EF6` | `#EEE6FF` |
| Interlúdio | Digital | Banco Inter | Superapp, investimentos e cashback | `#EF9F36` | `#3C3C46` | `#FDE6C6` |

### 🇺🇸 Estados Unidos (USD): 4 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Liberty Federal | Tradicional | JPMorgan Chase | Grande banco comercial e de investimentos | `#143E4B` | `#B98958` | `#E6EDEB` |
| Wells Prairie | Tradicional | Wells Fargo | Hipotecas, crédito imobiliário e agências | `#8A4436` | `#D18C6F` | `#F6E2D1` |
| Bank of Everywhere | Tradicional | Bank of America | Contas, investimentos e serviços corporativos | `#174E72` | `#6ED3B8` | `#E1F4EF` |
| SolFi | Digital | SoFi | Crédito pessoal, refinanciamento e investimentos | `#E6C453` | `#1B2B24` | `#F7F3D6` |

### 🇪🇺 Zona do Euro (EUR): 4 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Santierra | Tradicional | Santander (Espanha) | Crédito de consumo e operações internacionais | `#9E3F42` | `#D7908F` | `#F7E3E1` |
| Deutmark | Tradicional | Deutsche Bank (Alemanha) | Investimentos, câmbio e serviços corporativos | `#132F58` | `#4D78C4` | `#E2EEFF` |
| Paribella | Tradicional | BNP Paribas (França) | Gestão patrimonial e financiamentos | `#216A69` | `#6FB3A2` | `#E6F3ED` |
| Nóvia26 | Digital | N26 (Alemanha) | Banco mobile, pagamentos e contas digitais | `#262733` | `#A7E4C5` | `#E8F9F0` |

### 🇬🇧 Reino Unido (GBP): 3 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Barkleys | Tradicional | Barclays | Cartões, crédito e banco de investimentos | `#316E9D` | `#78B3DE` | `#E3F0FA` |
| Loydgate | Tradicional | Lloyds Bank | Contas pessoais, poupança e hipotecas | `#184B44` | `#8FBF8A` | `#E6F5E9` |
| Mintzo | Digital | Monzo | Controle de gastos, metas e orçamento pessoal | `#EF6C73` | `#4B2E2B` | `#FFE5E7` |

### 🇯🇵 Japão (JPY): 3 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Mitsuhara | Tradicional | MUFG Bank | Grande banco universal e serviços globais | `#8C293D` | `#D7A9A9` | `#F5E8E1` |
| Sumisora | Tradicional | Sumitomo Mitsui (SMBC) | Financiamentos e serviços empresariais | `#304F8B` | `#7EA6E6` | `#E4EEFF` |
| Rakun Bank | Digital | Rakuten Bank | Pagamentos online, pontos e comércio digital | `#A64357` | `#E394A9` | `#FDE6EB` |

### 🇮🇳 Índia (INR): 3 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Monsoon State | Tradicional | State Bank of India | Banco público, crédito e serviços populares | `#1C7080` | `#D7B06A` | `#E5F4F7` |
| Jupitara | Digital | Jupiter | Gestão de despesas e serviços financeiros digitais | `#6854AB` | `#BBA8F4` | `#EFEAFF` |
| Fiiesta | Digital | Fi Money | Automação financeira e organização de gastos | `#C35B29` | `#F4C770` | `#FFF4DB` |

### 🌐 Instituições internacionais (multimoeda): 3 bancos

| Banco | Tipo | Inspiração | Especialidade | Cor 1 | Cor 2 | Cor 3 |
|---|---|---|---|---|---|---|
| Hexagon Continental | Tradicional | HSBC | Serviços internacionais e gestão de patrimônio | `#243B57` | `#C9A24F` | `#E9E3D1` |
| Nomadex | Digital | Wise | Câmbio, contas multimoedas e remessas | `#C7E953` | `#2E7D32` | `#EAF8D1` |
| Revolux | Digital | Revolut | Câmbio, cartões internacionais e ativos digitais | `#242540` | `#8DB6FF` | `#E6EEFF` |

### Tradicional × Digital

A diferença no jogo ainda será detalhada. A direção é que tradicionais cobrem mais tarifas e tenham crédito
grande (hipoteca, financiamento), e digitais tenham conta gratuita, aprovação rápida e limites iniciais menores.
A especialidade de cada banco vira uma vantagem concreta: por exemplo, o Wells Prairie com hipoteca mais barata, o
Nomadex e o Revolux com câmbio próximo da cotação, o Rakun Bank com pontos.

## 6. Moedas

Cada região usa sua moeda: BRL, USD, EUR, GBP, JPY e INR. Os bancos internacionais (Hexagon Continental, Nomadex e
Revolux) oferecem contas multimoeda. Como há várias moedas, o app tem câmbio (ver 9 e 10).

## 7. Visual

### Tema do Kinpital

O mesmo tema do Clotheskin (`screen/theme.css`): fundo quente, cartões de vidro, coral `#c7503c` como destaque e o
tema alternativo "sage" (verde). Todas as cores ficam em variáveis num só arquivo. Os componentes nunca usam cor
fixa.

### Tema de cada banco

Ao entrar num banco, a tela troca as variáveis de cor e ganha cara de app bancário (cabeçalho colorido, cartão,
saldo em destaque). Mapeamento proposto:

| Variável | Valor |
|---|---|
| `--accent` | cor 1 |
| `--on-accent` | texto sobre a cor 1 (branco, ou escuro: ver tabela de contraste) |
| `--accent-deep` | versão escura da cor 1, para texto sobre fundo claro |
| `--bg` | cor 3 |
| `--bg-glow-1`, `--bg-glow-2` | cor 2 com transparência |

### Contraste (acessibilidade)

Regra: texto sobre qualquer cor precisa de pelo menos **4,5:1** (WCAG AA). Medido com texto branco sobre a cor 1,
18 bancos passam. Estes 6 precisam de texto escuro ou de um ajuste na cor:

| Banco | Branco sobre cor 1 | Proposta de `--on-accent` | Contraste com a proposta |
|---|---|---|---|
| Nomadex `#C7E953` | 1,4 | `#1B4D20` (verde mais fechado que a cor 2) | 7,1 |
| SolFi `#E6C453` | 1,7 | `#1B2B24` (a própria cor 2) | 8,7 |
| Interlúdio `#EF9F36` | 2,2 | `#3C3C46` (a própria cor 2) | 5,0 |
| Mintzo `#EF6C73` | 3,0 | `#2E1A18` (cor 2 escurecida, `#4B2E2B` dá só 4,1) | 5,5 |
| Itauba `#E7642D` | 3,4 | `#2B1408` (marrom escuro) | 5,2 |
| Fiiesta `#C35B29` | 4,3 | branco, com botão em `#B04F22` | 5,3 |
| *(os outros 18)* | 5,5 a 14,9 | branco | ✅ |

*(Barkleys, o mais baixo dos que passam, tem 5,5.)*

### Tela inicial (protótipo)

Uma coluna, no tema do Kinpital:

1. **Cabeçalho:** "Kinpital", data e hora, botão de configurações.
2. **De quem é a visão:** botões "You" e um por Kin anexado. A tela inteira muda conforme a pessoa escolhida.
3. **Patrimônio líquido:** contas + bens − faturas − empréstimos, convertido para a moeda escolhida. Tem botão de olho
   para esconder os valores e mostra a variação do mês.
4. **Coming up:** faturas, parcelas e dias de pagamento, por data. Atrasos vêm primeiro, em vermelho.
5. **Áreas:** KinWallet, Assets, Work & Income e Market (marcado "em breve").
6. **Atividade recente** de todos os bancos, com o logo de cada um.
7. **Câmbio do dia** no rodapé.

Por enquanto o protótipo mostra as finanças de todos, como um "administrador" do jogo. Quem vê o quê ainda está em
aberto (ver 13).

### Logos

A imagem de referência é um bitmap com os 24 logos juntos e em baixa resolução. No app, cada logo precisa ser um
**SVG** próprio: nítido em qualquer tamanho e leve. Não existem arquivos separados, então os 24 logos foram
redesenhados em SVG a partir da imagem, em `screen/assets/banks/<id>.svg` (só o símbolo, sem o nome).

Os nomes são paródias. As cores e os logos devem ter identidade própria, sem copiar as marcas reais.

## 8. Tempo

- **Tempo real.** Vencimentos, juros e atrasos seguem o calendário de verdade, no fuso horário do usuário.
- **Uma execução agendada por dia,** de madrugada: fecha faturas, cobra parcelas, aplica juros e rendimentos, marca
  atrasos e paga salários. Uma vez por dia gasta poucos créditos (o Clotheskin roda a cada 15 minutos).
- **Recuperação de dias perdidos.** Se uma execução falhar ou o Kindroid ficar fora do ar, a próxima processa os dias
  pendentes em ordem, sem cobrar nada duas vezes.
- **Juros com base anual ou mensal,** convertidos em taxa diária.

## 9. Funcionalidades bancárias

| Funcionalidade | Comportamento |
|---|---|
| **Pagamentos** | Transferência entre contas (usuário ↔ Kin, Kin ↔ Kin), pagamento de contas e compras no cartão |
| **Parcelamento** | Compra no cartão em X parcelas, com ou sem juros conforme o banco, lançadas nas faturas futuras |
| **Empréstimos** | Valor, prazo e taxa geram parcelas mensais (tabela Price). Aprovação conforme renda e score |
| **Dívidas** | Atraso gera multa e juros de mora, o score cai e limite e taxas pioram |
| **Câmbio** | Cotação base mais o *spread* do banco |
| **Juros por banco** | Cada banco tem sua tabela: rotativo do cartão, empréstimo pessoal, cheque especial, financiamento, rendimento da conta e tarifas |

A lista ainda está sendo definida e pode crescer.

## 10. Dados reais (modelo híbrido)

A economia de base é real e os bancos fictícios aplicam suas margens por cima:

| Dado | Fonte real candidata (gratuita, sem chave) | Uso no jogo |
|---|---|---|
| Câmbio | Cotações de referência do BCE (API Frankfurter) | Cotação do dia mais o *spread* do banco |
| Juros básicos | Selic (API do Banco Central do Brasil), taxa do Fed, taxa do BCE… | Taxa básica do país mais a margem do banco |
| Bolsa (futuro) | Índices reais (Ibovespa, S&P 500…) | Empresas fictícias cujas ações seguem o índice com variação própria |

A execução diária busca esses dados uma vez por dia e guarda. Se falhar, usa os do dia anterior.

**Pendência:** confirmar no guia do Kindroid se programas do Workshop têm permissão (*grant*) de acesso à rede. O
Clotheskin não usa rede. **Plano B:** tabela de taxas e cotações embutida no app, atualizada a cada versão.

## 11. Imóveis e bens

Comprar casa, carro e outros bens, pagando à vista ou financiando por um banco (o Wells Prairie e o Loydgate se
destacam em hipotecas). Detalhes a definir.

## 12. Trabalho e renda

O usuário e os Kins recebem salário mensal em tempo real, direto na conta. Detalhes a definir (ver 13).

## 13. Perguntas em aberto

1. **"Anexado":** confirmar que são os Kins com o programa anexado no Workshop.
2. **Como o Kin movimenta dinheiro:** o Kin faz transações durante a conversa (ex.: "te mandei R$ 50" vira uma
   transferência no app), ou só o usuário opera pelo app e o Kin é informado (`kin tell`)? *(Adiado: será pensado
   depois.)*
3. **Vencimento da fatura:** ~~cada pessoa escolhe ou dia fixo por banco?~~ Decidido: sorteado (ver 14). Falta
   definir o intervalo do sorteio e quantos dias antes a fatura fecha.
4. **Salário dos Kins:** de onde vem o valor? Da profissão no backstory do Kin, escolhido pelo usuário, ou outra
   regra?
5. **Rede no Workshop:** existe *grant* de rede? (ver 10)
6. **Saldo inicial:** ~~com quanto cada pessoa começa?~~ Decidido: zero, e cada um informa o próprio dinheiro na
   primeira vez (ver 14). Falta definir o fluxo: em que moeda, se vira dinheiro em espécie ou já entra numa conta, e
   como o Kin informa o dele.
7. **Moeda principal:** em que moeda a KinWallet mostra o saldo total (BRL por padrão)?
8. **Realismo dos juros:** usar taxas no nível real (o rotativo no Brasil passa de 400% ao ano) ou suavizar?
9. **O que o Kin sabe:** o Kin é informado das próprias finanças (saldo, dívidas) para usar no roleplay?
10. **Tradicional × Digital:** quais diferenças concretas no jogo?
11. **Privacidade:** o usuário vê tudo dos Kins, só as próprias finanças, ou um meio-termo (saldo sem extrato)?

## 14. Histórico de decisões

- **2026-11-23:** nome do app geral: **Kinpital**. **KinWallet** é a área da carteira e dos 24 bancos (antes era o
  nome do projeto inteiro).
- **2026-11-23:** formato: programa do Workshop do Kindroid, no mesmo modelo do Clotheskin.
- **2026-11-23:** usuário e Kins anexados têm contas.
- **2026-11-23:** 24 bancos em 7 regiões, com logo e paleta de 3 cores cada (imagem de referência).
- **2026-11-23:** tema do Kinpital = tema do Clotheskin. Dentro de um banco, a tela assume as cores dele.
- **2026-11-23:** tempo real (vencimentos de verdade), com uma execução diária.
- **2026-11-23:** dados reais para câmbio e juros básicos, se o Workshop permitir rede (modelo híbrido).
- **2026-11-23:** áreas além da KinWallet: Imóveis e bens e Trabalho e renda confirmadas; Bolsa depende dos dados
  reais.
- **2026-11-23:** toda a interface em **inglês** (como o Clotheskin). Os documentos para o usuário continuam em
  português.
- **2026-11-23:** os logos são redesenhados em SVG a partir da imagem de referência.
- **2026-11-23:** como o Kin movimenta dinheiro fica para depois.
- **2026-11-23:** primeira tela: protótipo da tela inicial, KinWallet, tela de cada banco com as cores dele, Assets,
  Work & Income e Settings, com dados de exemplo.
- **2026-11-23:** todos (usuário e Kins) começam com **zero**. Na primeira vez que abrem o app, cada um **informa
  quanto dinheiro tem**.
- **2026-11-23:** o **dia de vencimento da fatura é sorteado** quando o cartão é emitido.
