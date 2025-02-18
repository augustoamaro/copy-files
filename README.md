# Copiador de Arquivos em Massa

Este é um script Node.js que copia arquivos de mídia de um diretório fonte para um diretório de destino de forma interativa, mantendo um registro do progresso da cópia.

## Funcionalidades

- Interface interativa para seleção de diretórios
- Copia arquivos de mídia (imagens e vídeos) de forma recursiva
- Suporta múltiplos formatos de arquivo
- Mostra progresso em tempo real
- Mantém os nomes originais dos arquivos
- Processa arquivos em subdiretórios
- Tratamento de arquivos duplicados
- Confirmações de segurança em cada etapa

## Formatos de Arquivo Suportados

- Imagens: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.gif`
- Vídeos: `.mov`, `.mp4`

## Pré-requisitos

Para executar este script, você precisa ter instalado:

- Node.js (versão 12 ou superior)
- npm (Node Package Manager)

## Instalação

1. Clone ou baixe este repositório
2. Instale as dependências:
```bash
npm install
```

## Como Usar

Execute o script:
```bash
npm run copy
```

O script irá guiá-lo através dos seguintes passos:

1. Seleção do diretório de origem
   - Use as setas ↑↓ para navegar
   - Pressione Enter para expandir/entrar em um diretório
   - Pressione Espaço para selecionar o diretório atual

2. Seleção do diretório de destino
   - Mesmo processo de navegação do passo anterior

3. Confirmação inicial
   - Confirme se os diretórios selecionados estão corretos

4. Análise dos arquivos
   - O script mostrará quantos arquivos foram encontrados

5. Confirmação final
   - Confirme se deseja prosseguir com a cópia

6. Processo de cópia
   - Acompanhe o progresso em tempo real
   - Veja informações sobre cada arquivo sendo copiado

## Funcionalidades Detalhadas

### Tratamento de Arquivos Duplicados
- Adiciona um número sequencial ao nome de arquivos duplicados
- Exemplo: foto.jpg → foto_1.jpg → foto_2.jpg

### Verificação de Arquivos Existentes
- Verifica se o arquivo já existe no destino
- Compara as datas de modificação
- Atualiza apenas arquivos mais recentes

### Feedback em Tempo Real
- Mostra o progresso total em porcentagem
- Exibe o nome de cada arquivo sendo copiado
- Fornece um resumo ao final da operação

## Saída do Console

O script fornece as seguintes informações durante a execução:

- Total de arquivos encontrados
- Nome do arquivo sendo copiado atualmente
- Progresso da cópia em porcentagem
- Status de cada arquivo (copiado/atualizado/ignorado)
- Resumo final da operação

## Notas Importantes

- O script mantém os nomes originais dos arquivos
- Arquivos com extensões não listadas serão ignorados
- O diretório de destino deve ter permissões de escrita
- Certifique-se de ter espaço suficiente no disco de destino
- É possível cancelar a operação em diferentes etapas

## Contribuição

Sinta-se à vontade para contribuir com este projeto através de pull requests ou reportando issues.



