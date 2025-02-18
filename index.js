const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');
const inquirer = require('inquirer');
inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'));

const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.mov', '.mp4'];

async function selectDirectories() {
    const questions = [
        {
            type: 'file-tree-selection',
            name: 'sourceDir',
            message: 'Selecione o diretório de origem:',
            onlyShowDir: true,
            root: '/',
            onlyShowValid: true,
        },
        {
            type: 'file-tree-selection',
            name: 'destDir',
            message: 'Selecione o diretório de destino:',
            onlyShowDir: true,
            root: '/',
            onlyShowValid: true,
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Confirma a cópia dos arquivos?',
            default: false
        }
    ];

    const answers = await inquirer.prompt(questions);

    if (!answers.confirm) {
        console.log('Operação cancelada pelo usuário.');
        process.exit(0);
    }

    return {
        sourceDir: answers.sourceDir,
        destDir: answers.destDir
    };
}

async function copyFiles() {
    try {
        console.log('\nSelecione os diretórios para a cópia dos arquivos:');
        const { sourceDir, destDir } = await selectDirectories();

        console.log('\nDiretórios selecionados:');
        console.log(`Origem: ${sourceDir}`);
        console.log(`Destino: ${destDir}\n`);

        // Garantir que o diretório de destino existe
        await fs.ensureDir(destDir);

        // Listar todos os arquivos recursivamente
        const entries = await fg('**/*', {
            cwd: sourceDir,
            onlyFiles: true,
            extglob: true,
            caseSensitiveMatch: false,
        });

        // Filtrar arquivos por extensões válidas
        const filesToCopy = entries.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return validExtensions.includes(ext);
        });

        if (filesToCopy.length === 0) {
            console.log('Nenhum arquivo encontrado para copiar.');
            return;
        }

        console.log(`Total de arquivos encontrados: ${filesToCopy.length}`);

        const { proceed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: `Deseja prosseguir com a cópia de ${filesToCopy.length} arquivos?`,
                default: false
            }
        ]);

        if (!proceed) {
            console.log('Operação cancelada pelo usuário.');
            return;
        }

        // Objeto para controlar arquivos duplicados
        const processedFiles = new Map();

        // Copiar arquivos um por um
        for (let i = 0; i < filesToCopy.length; i++) {
            const file = filesToCopy[i];
            const sourcePath = path.join(sourceDir, file);
            let fileName = path.basename(file);
            let destPath = path.join(destDir, fileName);

            // Verificar se já existe um arquivo com o mesmo nome
            if (processedFiles.has(fileName)) {
                const fileExt = path.extname(fileName);
                const fileNameWithoutExt = path.basename(fileName, fileExt);
                const count = processedFiles.get(fileName) + 1;
                fileName = `${fileNameWithoutExt}_${count}${fileExt}`;
                destPath = path.join(destDir, fileName);
                processedFiles.set(fileName, count);
            } else {
                processedFiles.set(fileName, 1);
            }

            // Verificar se o arquivo já existe no destino
            if (await fs.pathExists(destPath)) {
                const sourceStats = await fs.stat(sourcePath);
                const destStats = await fs.stat(destPath);

                if (sourceStats.mtime > destStats.mtime) {
                    await fs.copy(sourcePath, destPath, { overwrite: true });
                    console.log(`Arquivo atualizado: ${fileName}`);
                } else {
                    console.log(`Arquivo ignorado (já existe): ${fileName}`);
                    continue;
                }
            } else {
                await fs.copy(sourcePath, destPath);
            }

            const progress = ((i + 1) / filesToCopy.length) * 100;
            console.log(`Progresso: ${progress.toFixed(2)}% - Copiando: ${fileName}`);
        }

        console.log('\nResumo da operação:');
        console.log(`Total de arquivos processados: ${filesToCopy.length}`);
        console.log(`Arquivos únicos: ${processedFiles.size}`);
        console.log('Cópia concluída com sucesso!');
    } catch (error) {
        console.error('Erro durante a cópia:', error.message);
    }
}

copyFiles();
