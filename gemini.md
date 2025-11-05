# Padrões Globais para Projetos - Gemini

## 1. Introdução

Este documento serve como uma referência global para todos os projetos, estabelecendo diretrizes de comunicação, padrões de comandos, estrutura de documentação e processos de manutenção. O objetivo é garantir consistência, clareza e eficiência no desenvolvimento e na colaboração.

## 2. Guia de Estilo e Comunicação

- **Idioma:** Todo o conteúdo, incluindo código, comentários e documentação, deve ser escrito em Português do Brasil (pt-BR).
- **Clareza e Objetividade:** Utilize uma linguagem direta e concisa. Evite jargões desnecessários e seja explícito nas instruções.
- **Formato:** A documentação deve seguir o padrão Markdown.

## 3. Padrões para Comandos

Todos os comandos devem ser compatíveis com sistemas operacionais Windows.

- **Versão Mínima Suportada:** Windows 10.
- **Shell Padrão:** Recomenda-se o uso do PowerShell 7.x ou superior. Comandos devem ser testados para garantir a compatibilidade.

### Comandos Essenciais

A seguir, uma lista de comandos essenciais com exemplos de uso. Alternativas para o `Command Prompt (CMD)` são fornecidas quando aplicável.

| Ação | PowerShell | Command Prompt (CMD) | Descrição |
| :--- | :--- | :--- | :--- |
| **Listar arquivos** | `Get-ChildItem` ou `ls` ou `dir` | `dir` | Lista arquivos e pastas no diretório atual. |
| **Mudar de diretório** | `Set-Location -Path C:\caminho\para\pasta` ou `cd C:\caminho\para\pasta` | `cd C:\caminho\para\pasta` | Altera o diretório de trabalho atual. |
| **Criar diretório** | `New-Item -ItemType Directory -Name "NovoDiretorio"` ou `mkdir "NovoDiretorio"` | `mkdir "NovoDiretorio"` | Cria um novo diretório. |
| **Remover arquivo** | `Remove-Item -Path "arquivo.txt"` ou `rm "arquivo.txt"` | `del "arquivo.txt"` | Exclui um arquivo. |
| **Remover diretório** | `Remove-Item -Recurse -Path "Diretorio"` ou `rm -r "Diretorio"` | `rmdir /s "Diretorio"` | Exclui um diretório e seu conteúdo. |
| **Copiar arquivo** | `Copy-Item -Path "origem.txt" -Destination "destino.txt"` | `copy "origem.txt" "destino.txt"` | Copia um arquivo. |
| **Mover arquivo** | `Move-Item -Path "origem.txt" -Destination "destino.txt"` | `move "origem.txt" "destino.txt"` | Move ou renomeia um arquivo. |
| **Procurar texto** | `Select-String -Path "*.txt" -Pattern "meu texto"` | `findstr "meu texto" *.txt` | Procura por uma string de texto dentro de arquivos. |

**Observação:** Sempre que possível, prefira os comandos do PowerShell por sua maior flexibilidade e poder.

**Observação:** Para encadear múltiplos comandos em uma única linha no Windows, utilize o ponto e vírgula (`;`) como separador. Diferente de sistemas baseados em Unix, que comumente utilizam `&&`.

## 4. Boas Práticas para Documentação

- **README.md:** Todo projeto deve ter um `README.md` na raiz, contendo:
  - Nome e descrição do projeto.
  - Pré-requisitos para instalação.
  - Instruções de setup e como executar o projeto.
  - Como rodar os testes.
  - Informações sobre o deploy.
- **Documentação de Arquitetura:** Para projetos complexos, inclua um documento descrevendo a arquitetura, as decisões tomadas e o fluxo de dados.
- **Comentários no Código:** Comente apenas o *porquê* de uma implementação, não *o que* ela faz. O código deve ser legível o suficiente para explicar o "o quê".

## 5. Validação

- **Testes de Comandos:** Antes de adicionar um novo comando a este guia, ele deve ser testado em uma instalação limpa do Windows 10 e Windows 11.
- **Revisão:** As instruções devem ser revisadas por pelo menos um outro membro da equipe para garantir a clareza.
- **Consistência:** A formatação Markdown deve ser consistente com o restante do documento. Utilize um linter de Markdown se possível.

## 6. Manutenção e Log de Alterações

Este documento deve ser revisado e atualizado a cada 6 meses ou sempre que uma nova ferramenta ou padrão for adotado pela equipe.

### Log de Alterações

| Data | Versão | Descrição da Alteração | Autor |
| :--- | :--- | :--- | :--- |
| 29/10/2025 | 1.0 | Criação inicial do documento. | Gemini |
