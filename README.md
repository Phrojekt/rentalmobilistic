# Rental Mobilistic

Rental Mobilistic é uma plataforma completa para aluguel de carros de terceiros. Os usuários podem alugar veículos ou listar seus próprios carros para aluguel de forma simples e segura.

## Funcionalidades

- **Landing Page**: Página inicial com informações sobre a plataforma e botões para registro e visualização de carros disponíveis.
- **Cadastro e Login**: Páginas dedicadas para registro e login de usuários.
- **Listagem de Carros**: Exibição de carros em destaque e uma página dedicada para visualizar todos os carros disponíveis.
- **Depoimentos**: Seção com feedback de usuários (proprietários e locatários).
- **Responsividade**: Design responsivo para garantir uma boa experiência em dispositivos móveis e desktops.

## Tecnologias Utilizadas

- **Next.js**: Framework React para renderização do lado do servidor e geração de páginas estáticas.
- **Tailwind CSS**: Framework CSS para estilização rápida e responsiva.
- **Firebase** : Hospedagem de Banco de Dados
- **TypeScript**: Linguagem para tipagem estática e desenvolvimento mais seguro.
- **Lucide Icons**: Biblioteca de ícones para melhorar a interface do usuário.

## Estrutura do Projeto

```plaintext
rentalmobilistic/
├── public/                # Arquivos públicos (imagens, ícones, etc.)
├── src/
│   ├── app/
        ├── admin/cars
           ├── [id]/       # Frontend de edição dos carros postados pelo usúario
           ├── new/        # Frontend de criação para colocar um carro para alugar
           ├── page.tsx    # Dashboard do usuário
           ├── layout.tsx  # Layout do usuário
│   │   ├── page.tsx       # Página inicial (Landing Page)
│   │   ├── register/      # Página de registro
│   │   ├── login/         # Página de login
│   │   └── cars/          # Página de listagem de carros
│   ├── components/
│   │   ├── Bookingmodal.tsx # Frontend do modal da reserva de aluguel dos carros
│   │   ├── CarDetails.tsx # Frontend do detalhamento da página de rota dinâmica de cada carro
│   │   ├── Carform.tsx    # Formulário para listar um carro para aluguel
│   │   ├── Cargrid.tsx    # Cartões de cada carro
│   │   ├── Header.tsx     # Cabeçalho com navegação e Dark Mode
│   │   ├── Hero.tsx       # Seção inicial com chamada para ação
│   │   ├── FeaturedCars.tsx # Carros em destaque
│   │   ├── SearchBar.tsx  # Barra de pesquisa
│   │   ├── SearchFilters.tsx # Filtros da barra de pesquisa
│   │   ├── Testimonials.tsx # Depoimentos de usuários
│   │   └── Footer.tsx     # Rodapé do site
│   └── styles/            # Estilos globais e configurações do Tailwind CSS
│   ├── contexts/          # Api de sistema de login
│   ├── hooks/             # Api de implementação de login de usuário  
│   ├── lib/               # Arquivo de config do Firebase
│   ├── Services/          # Backend(APIs e afins)
│   │   ├── carServices.ts  # Api da manipulação seja criação editar ou exclusão de novos carros
│       ├── cartServices.ts # Api da manipulação do sistema de aluguel de carros
│       ├── userServices.ts # Api da criação e manipulação de usuários
├── README.md              # Documentação do projeto
├── package.json           # Dependências e scripts do projeto
└── tailwind.config.js     # Configuração do Tailwind CSS
```

## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- Gerenciador de pacotes (npm, yarn, pnpm ou bun)

### Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/rental-mobilistic.git
   cd rental-mobilistic
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar o projeto.

## Funcionalidades Detalhadas

### Header
- Navegação com links para as páginas principais: Home, Cars, How it Works e About Us.
- Botões para Login e Registro.

### Hero Section
- Texto introdutório sobre a plataforma.
- Botões para registro e visualização de carros disponíveis.

### Featured Cars
- Exibição de carros em destaque com informações como nome, preço, cidade e disponibilidade.
- Botão "View All Cars" que redireciona para a página de listagem completa de carros.

### Testimonials
- Depoimentos de usuários (proprietários e locatários) com feedback sobre a plataforma.

### Footer
- Informações adicionais e links úteis.

## Próximos Passos

- Implementar autenticação real para login e registro.
- Adicionar integração com uma API para listar carros reais.
- Melhorar a acessibilidade do site.
- Adicionar testes automatizados para garantir a qualidade do código.

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção: `git checkout -b minha-feature`.
3. Faça commit das suas alterações: `git commit -m 'Minha nova feature'`.
4. Envie para o repositório remoto: `git push origin minha-feature`.
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.

---

Desenvolvido com ❤️ pela equipe Rental Mobilistic.



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
