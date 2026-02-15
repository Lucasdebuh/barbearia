# 💈 Sistema de Agendamento Barbearia PRO - Edição Avançada

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)
![Auto Refresh](https://img.shields.io/badge/auto--refresh-5s-orange.svg)

## 🌟 NOVIDADES DESTA VERSÃO

### ✨ Recursos Premium Implementados

#### 🔄 **Auto-Atualização Inteligente**
- ✅ Atualiza agenda a cada 5 segundos sem piscar
- ✅ Atualização silenciosa em segundo plano
- ✅ Não interrompe a navegação do usuário
- ✅ Estatísticas em tempo real

#### 👨‍💼 **Sistema de Múltiplos Barbeiros**
- ✅ Cadastro completo de barbeiros
- ✅ Foto, especialidade, bio e contato
- ✅ Ativação/desativação individual
- ✅ Cliente escolhe o barbeiro preferido
- ✅ Agendas separadas por barbeiro
- ✅ Ranking de performance

#### 💳 **Pagamentos Online via Mercado Pago**
- ✅ Integração com API do Mercado Pago
- ✅ Pagamento via PIX com QR Code
- ✅ Cartão de crédito e débito
- ✅ Confirmação automática de pagamento
- ✅ Opção de pagar no local
- ✅ Dashboard financeiro completo

#### 📊 **Dashboard Administrativo Avançado**
- ✅ Estatísticas em tempo real
- ✅ Gráficos de performance
- ✅ Ranking de barbeiros
- ✅ Relatórios financeiros
- ✅ Controle de receita mensal
- ✅ Próximos agendamentos

#### 🎨 **Interface Ultra Premium**
- ✅ Animações de estrelas no header
- ✅ Sistema de passos (wizard)
- ✅ Cards interativos com efeitos hover
- ✅ Gradientes modernos
- ✅ Design responsivo total
- ✅ Ícones Font Awesome 6.0
- ✅ Fonte Poppins premium

#### 🛠️ **Gerenciamento de Serviços**
- ✅ Cadastro de múltiplos serviços
- ✅ Preços diferenciados
- ✅ Duração customizada
- ✅ Ativação/desativação
- ✅ Descrição detalhada

#### 📱 **Funcionalidades Extras**
- ✅ Integração com WhatsApp
- ✅ Notificações visuais
- ✅ Status de agendamentos
- ✅ Exportação de dados (JSON)
- ✅ Sistema de backup
- ✅ Troca de senha admin
- ✅ Sidebar retrátil
- ✅ Filtros de relatórios

---

## 🚀 Como Usar

### 📋 Instalação Rápida

1. **Baixe os arquivos**
   - index.html
   - admin.html
   - style.css
   - script.js

2. **Abra o sistema**
   - Clique em `index.html` para a página do cliente
   - Clique em `admin.html` para o painel administrativo

3. **Senha padrão do admin:** `admin`

---

## 📂 Estrutura do Sistema

```
barbearia_avancada/
│
├── index.html          # Página do cliente (sistema de agendamento)
├── admin.html          # Painel administrativo completo
├── style.css           # Estilos premium com animações
├── script.js           # Lógica completa do sistema
└── README.md           # Esta documentação
```

---

## 💻 Funcionalidades Detalhadas

### 🎯 PARA CLIENTES

#### **Passo 1: Dados Pessoais**
- Nome completo
- WhatsApp (obrigatório)
- E-mail (opcional)

#### **Passo 2: Escolha do Barbeiro**
- Visualização de todos os barbeiros
- Fotos e especialidades
- Seleção interativa

#### **Passo 3: Data e Horário**
- Calendário interativo
- Horários em tempo real
- Indicadores visuais (disponível/ocupado)
- Agendas separadas por barbeiro

#### **Passo 4: Pagamento**
- Resumo completo do agendamento
- Opção 1: Pagar no local
- Opção 2: Pagar online (PIX/Cartão)
- QR Code para pagamento instantâneo

---

### 👨‍💼 PARA ADMINISTRADORES

#### **Dashboard**
- **Cards de Estatísticas:**
  - Agendamentos de hoje
  - Receita do mês
  - Total de clientes
  - Barbeiros ativos

- **Gráfico Semanal:**
  - Visualização de agendamentos dos últimos 7 dias
  - Chart.js integrado

- **Próximos Agendamentos:**
  - Lista dos 5 próximos atendimentos
  - Atualização automática

#### **Gestão de Agendamentos**
- **Tabela Completa com:**
  - Horário
  - Cliente + WhatsApp (link direto)
  - Barbeiro
  - Serviço
  - Valor
  - Status de pagamento
  - Status do atendimento
  
- **Ações Rápidas:**
  - ✅ Marcar como pago
  - ✅ Concluir atendimento
  - ❌ Cancelar agendamento

- **Auto-atualização a cada 5 segundos**

#### **Cadastro de Barbeiros**
- Nome completo
- Especialidade
- Foto (URL)
- Telefone/WhatsApp
- Biografia
- Status (ativo/inativo)
- Editar e excluir

#### **Gerenciamento de Serviços**
- Nome do serviço
- Preço (R$)
- Duração (minutos)
- Descrição
- Status (ativo/inativo)
- Múltiplos serviços

#### **Integração de Pagamentos**
- Configuração do Mercado Pago:
  - Access Token
  - Public Key
  - Ativar/desativar

- Estatísticas:
  - Receita online
  - Receita local
  - Total do mês

#### **Configurações Gerais**
- Nome da barbearia
- Cor principal (tema dinâmico)
- Horário de funcionamento
- Tempo padrão de atendimento
- Alterar senha admin
- Exportar dados
- Resetar sistema

#### **Relatórios Financeiros**
- Filtros por período:
  - Hoje
  - Esta semana
  - Este mês
  - Personalizado

- Métricas exibidas:
  - Total de atendimentos
  - Receita total
  - Pagamentos online
  - Valores pendentes
  - Ranking de barbeiros

---

## 🔐 Integração com Mercado Pago

### Como Configurar:

1. **Crie uma conta no Mercado Pago**
   - Acesse: https://www.mercadopago.com.br

2. **Obtenha suas credenciais**
   - Vá para: https://www.mercadopago.com.br/developers/panel/credentials
   - Copie o **Access Token** e **Public Key**

3. **Configure no Admin**
   - Acesse: Admin > Pagamentos
   - Cole suas credenciais
   - Ative o checkbox "Habilitar pagamentos online"
   - Salve

4. **Teste o sistema**
   - Faça um agendamento como cliente
   - Escolha "Pagar Online"
   - Escaneie o QR Code gerado

---

## 🎨 Personalização

### Alterar Tema
1. Acesse o painel admin
2. Vá em "Configurações"
3. Clique no seletor de cor
4. Escolha sua cor
5. Salve

O tema será aplicado automaticamente em todo o site!

### Modificar Horários
- Abertura e fechamento
- Duração de atendimento (30, 45, 60, 90 min)

### Cadastrar Barbeiros
- Adicione quantos barbeiros precisar
- Ative/desative conforme necessidade
- Cada barbeiro tem agenda separada

### Criar Serviços
- Serviços ilimitados
- Preços diferenciados
- Durações customizadas

---

## 📊 Auto-Atualização (5 segundos)

### Como Funciona:

O sistema implementa um mecanismo inteligente de atualização:

```javascript
// Atualiza automaticamente sem piscar
setInterval(() => {
    if(paginaAdminAberta) {
        atualizarAgendamentos(); // Sem reload
        atualizarEstatisticas(); // Dados em tempo real
    }
}, 5000); // 5 segundos
```

### Benefícios:
- ✅ Múltiplos admins podem trabalhar simultaneamente
- ✅ Não perde dados durante edição
- ✅ Atualização silenciosa (sem piscar)
- ✅ Economiza banda (só atualiza dados)

---

## 🌐 Hospedagem no GitHub Pages

### Passo a Passo Completo:

```bash
# 1. Crie um repositório no GitHub
# Nome sugerido: barbearia-pro-system

# 2. Clone ou faça upload dos arquivos
git init
git add .
git commit -m "🚀 Sistema de Agendamento PRO v4.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/barbearia-pro-system.git
git push -u origin main

# 3. Ative o GitHub Pages
# Vá em: Settings > Pages
# Source: main branch / root
# Save

# 4. Seu site estará em:
# https://SEU-USUARIO.github.io/barbearia-pro-system/
```

---

## 🔒 Segurança

### Dados Armazenados:
- LocalStorage do navegador
- Dados não são enviados para servidores externos
- Backup manual via exportação JSON

### Senha Admin:
- Padrão: `admin`
- **⚠️ IMPORTANTE:** Altere imediatamente no primeiro acesso!
- Vá em: Admin > Configurações > Segurança

### Recomendações:
- Use senha forte (mínimo 8 caracteres)
- Faça backup regularmente
- Para produção, considere backend real

---

## 🆘 Solução de Problemas

### Auto-atualização não funciona
- Verifique se está na aba correta
- Abra o Console (F12) para verificar erros
- Certifique-se que JavaScript está habilitado

### Dados sumiram
- Verificar se limpou cache do navegador
- Use sempre o mesmo navegador/dispositivo
- Fazer backup antes de limpar cache

### Pagamento online não funciona
- Verifique credenciais do Mercado Pago
- Access Token e Public Key devem estar corretos
- Checkbox "Habilitar" deve estar marcado

### Barbeiros não aparecem
- Verifique se estão cadastrados
- Certifique-se que estão "Ativos"
- Recarregue a página

---

## 📈 Roadmap (Próximas Versões)

### v4.1 (Em breve)
- [ ] Push notifications
- [ ] Confirmação por SMS
- [ ] Upload de logo da barbearia
- [ ] Temas prontos

### v4.2
- [ ] Backend com Firebase
- [ ] Sincronização multi-dispositivo
- [ ] App PWA instalável
- [ ] Modo offline

### v4.3
- [ ] Integração com Google Calendar
- [ ] Envio automático de lembretes
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade

---

## 🤝 Contribuindo

Quer melhorar o sistema? Siga os passos:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona X'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

Isso significa que você pode:
- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Uso privado

---

## 👨‍💻 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Framework CSS:** Bootstrap 4.5.2
- **Ícones:** Font Awesome 6.0
- **Gráficos:** Chart.js 3.9.1
- **Fonte:** Poppins (Google Fonts)
- **Armazenamento:** LocalStorage
- **Pagamentos:** Mercado Pago SDK

---

## 📞 Suporte

### Precisa de ajuda?

- 📧 **Email:** contato@seubarbearia.com
- 💬 **WhatsApp:** (11) 99999-9999
- 🐛 **Issues:** [Abrir Issue no GitHub](https://github.com/seu-usuario/barbearia-pro/issues)
- 📚 **Documentação:** Este README

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ para facilitar a gestão de barbearias modernas.

### Agradecimentos especiais:
- Bootstrap Team
- Font Awesome
- Chart.js Contributors
- Mercado Pago Developers
- Comunidade Open Source

---

## 📊 Status do Projeto

```
███████████████████████████████████ 100%
```

**Status:** ✅ Produção - Pronto para uso!

**Última atualização:** Fevereiro 2026

---

<div align="center">

### ⭐ Se este sistema foi útil, deixe uma estrela no GitHub!

**[🌐 Ver Demo](https://seu-usuario.github.io/barbearia-pro/)** | **[📝 Reportar Bug](https://github.com/seu-usuario/barbearia-pro/issues)** | **[💡 Sugerir Feature](https://github.com/seu-usuario/barbearia-pro/issues/new)**

---

💈 **Barbearia PRO System** - Transformando agendamentos em experiências

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

</div>