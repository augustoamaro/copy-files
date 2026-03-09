# Análise de Arquitetura e Clean Code

## Diagnóstico rápido

O projeto é funcional e resolve bem o caso principal (cópia interativa de mídias), mas estava com responsabilidades concentradas em uma função grande (`copyFiles`) e com acoplamento alto entre interface (prompts), regra de negócio (seleção/validação de arquivos) e infraestrutura (filesystem).

## Melhorias aplicadas

1. **Separação de responsabilidades**
   - Extraídas funções específicas:
     - `getMediaFiles`: descoberta e filtro de arquivos.
     - `buildUniqueDestinationPath`: resolução de nomes duplicados.
     - `copyIfNeeded`: política de atualização/skip por data de modificação.
     - `logCopyResult`: padronização de mensagens por status.
   - Benefício: cada função possui intenção única e fica mais fácil testar/manter.

2. **Melhor testabilidade**
   - Introduzido `main()` com `if (require.main === module)`.
   - Funções exportadas via `module.exports` para permitir testes unitários.
   - Benefício: evita execução automática em import e facilita automação de testes.

3. **Modelagem de constantes**
   - Troca de array por `Set` em `VALID_EXTENSIONS`.
   - Benefício: expressa melhor intenção de membership check e simplifica leitura.

4. **Saída de fluxo sem `process.exit` dentro de função utilitária**
   - `selectDirectories` retorna `null` em cancelamento em vez de encerrar processo diretamente.
   - Benefício: reduz efeito colateral e melhora reutilização.

## Próximas melhorias recomendadas

1. **Arquitetura por camadas (CLI / Application / Domain / Infra)**
   - `cli/`: inquirer, formatação de logs.
   - `application/`: casos de uso (`CopyMediaFilesUseCase`).
   - `domain/`: regras puras (extensão válida, nome único, política de overwrite).
   - `infra/`: adapter de filesystem (`FsRepository`).

2. **Observabilidade e UX**
   - Adicionar relatório final com contadores por status: `copied`, `updated`, `skipped`, `failed`.
   - Mostrar tempo total de execução.

3. **Resiliência**
   - Continuar processo mesmo se um arquivo falhar (com coleta de erros).
   - Salvar log de falhas em arquivo (`.json` ou `.log`) no final.

4. **Configuração externa**
   - Suportar extensões via argumento CLI ou arquivo de configuração.
   - Ex.: `--ext=.jpg,.png,.mp4`.

5. **Qualidade de código**
   - Adicionar ESLint + Prettier + scripts `lint` e `format`.
   - Incluir testes unitários (Vitest/Jest) para regras puras.

6. **Evolução de performance**
   - Para volumes muito altos, permitir cópia concorrente com limite (`p-limit`) para balancear throughput e IO.

## Nota sobre bug potencial evitado

A lógica de nomes duplicados passa a controlar o contador por **nome original**, evitando inconsistências ao atualizar as chaves do mapa durante o processamento.
