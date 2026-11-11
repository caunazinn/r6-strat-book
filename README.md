# R6 Strat-Book

Planejador tático web para **Rainbow Six Siege**. Veja os blueprints dos mapas competitivos, desenhe rotas de ataque e defesa, posicione operadores, marque paredes reforçadas, breaches e drones, e compartilhe a strat com o time por link.

> Projeto de fã, sem vínculo com a Ubisoft. Rainbow Six Siege e os materiais do jogo são marcas e propriedade da Ubisoft.


<img width="1920" height="957" alt="image" src="https://github.com/user-attachments/assets/d789b908-71eb-422e-8ebf-59706913b83b" />




## Funcionalidades

- 14 mapas com blueprints por andar (subsolo, 1º, 2º, 3º andar e telhado)
- Zoom e pan no mapa
- Rotas livres, setas, rotações (setas tracejadas) e notas de texto
- Operadores de ataque e defesa arrastáveis
- Marcadores de parede reforçada (duplo clique gira), breach e drone
- Desfazer e refazer (`Ctrl+Z` / `Ctrl+Y`), apagar itens e limpar andar
- Exportar em PNG e JSON, importar JSON
- Login por e-mail e links públicos de compartilhamento
- Funciona também sem login, salvando rascunhos no navegador

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS |
| Canvas | Konva + react-konva |
| Estado | Zustand (com histórico de undo/redo) |
| Backend | Supabase (Auth e PostgreSQL) |

## Como rodar

Pré-requisito: Node.js 18 ou superior.

```bash
git clone https://github.com/caunazinn/r6-strat-book.git
cd r6-strat-book
npm install
npm run dev
```

Abra http://localhost:3000.

## Estrutura

```
app/                 rotas: landing, /editor e /s/[slug]
components/          Editor, StratCanvas e AuthButton
lib/store.ts         estado global com histórico (undo/redo)
lib/maps.ts          definição dos mapas e andares
lib/operators.ts     lista de operadores
lib/strats.ts        persistência das strats
public/maps/         blueprints em WebP
supabase/            schema do banco
```

## Roadmap

- [ ] Zoom inicial centrado no prédio de cada mapa
- [ ] Colaboração em tempo real
- [ ] Fases da tática (setup, execução, pós-plant)
- [ ] Biblioteca pública de strats com busca e filtros
- [ ] Redimensionar e rotacionar itens
- [ ] Testes automatizados e CI

## Créditos e aviso legal

Os blueprints dos mapas pertencem à Ubisoft Entertainment. Este é um projeto de fã, não comercial e sem afiliação com a empresa.

## Licença

O código é distribuído sob a licença MIT. Os assets do jogo não estão cobertos por ela.
