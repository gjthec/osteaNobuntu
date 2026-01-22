// promote-copy-ts.mjs
// Uso:
//   node promote-copy-ts.mjs /caminho/do/backend           (dry-run)
//   node promote-copy-ts.mjs /caminho/do/backend --apply   (aplica)
// Opcional:
//   --no-backup  (não salva backup do alvo antigo)

import fs from "fs/promises";
import path from "path";

const args = process.argv.slice(2);
const root = path.resolve(args[0] ?? ".");
const APPLY = args.includes("--apply");
const NO_BACKUP = args.includes("--no-backup");

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  ".git",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
]);

function getTargetPathIfCopyTs(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);

  // Ignora qualquer coisa que seja index copy.ts / index.ts
  // (o "menos pra index" do seu pedido)
  const lower = base.toLowerCase();
  if (lower === "index.ts" || lower === "index copy.ts" || lower === "index.copy.ts" || lower === "index_copy.ts") {
    return null;
  }

  // Caso principal do print: "nome copy.ts"
  if (base.endsWith(" copy.ts")) {
    const targetBase = base.slice(0, -" copy.ts".length) + ".ts";
    if (targetBase.toLowerCase() === "index.ts") return null;
    return path.join(dir, targetBase);
  }

  // Suporte extra (se existir no repo): nome.copy.ts, nome_copy.ts, nome-copy.ts
  const variants = [".copy.ts", "_copy.ts", "-copy.ts"];
  for (const v of variants) {
    if (base.endsWith(v)) {
      const targetBase = base.slice(0, -v.length) + ".ts";
      if (targetBase.toLowerCase() === "index.ts") return null;
      return path.join(dir, targetBase);
    }
  }

  // Se termina literalmente com "copy.ts" mas não bate nos formatos acima,
  // não arrisca (pra evitar renome errado)
  return null;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const backupRoot = path.join(root, ".copy_ts_backup", timestamp());

let found = 0;
let skipped = 0;
let planned = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(full);
      continue;
    }

    if (!ent.isFile()) continue;

    const target = getTargetPathIfCopyTs(full);
    if (!target) continue;

    found++;

    // Segurança extra: não mexer se o alvo for index.ts
    if (path.basename(target).toLowerCase() === "index.ts") {
      skipped++;
      continue;
    }

    planned++;

    const relSrc = path.relative(root, full);
    const relTgt = path.relative(root, target);

    const tgtExists = await exists(target);

    console.log(`\n[${APPLY ? "APPLY" : "DRY"}] ${relSrc}  ->  ${relTgt}`);

    if (!APPLY) {
      if (tgtExists) console.log(`  - iria substituir (alvo existe)`);
      else console.log(`  - iria criar (alvo não existe)`);
      continue;
    }

    // Backup do alvo antigo, se existir
    if (tgtExists && !NO_BACKUP) {
      const backupPath = path.join(backupRoot, relTgt);
      await ensureDir(path.dirname(backupPath));
      await fs.copyFile(target, backupPath);
      console.log(`  - backup salvo em: ${path.relative(root, backupPath)}`);
    }

    // Remove alvo antigo (se existir), depois renomeia o copy -> alvo
    if (tgtExists) {
      await fs.rm(target, { force: true });
      console.log(`  - removido alvo antigo`);
    }

    await ensureDir(path.dirname(target));
    await fs.rename(full, target);
    console.log(`  - renomeado copy.ts para o nome final`);
  }
}

(async () => {
  console.log(`Root: ${root}`);
  console.log(`Modo: ${APPLY ? "APLICAR" : "DRY-RUN (simulação)"}`);
  if (APPLY && !NO_BACKUP) console.log(`Backup: ${backupRoot}`);

  await walk(root);

  console.log("\n==== RESUMO ====");
  console.log(`Encontrados: ${found}`);
  console.log(`Planejados: ${planned}`);
  console.log(`Ignorados:  ${skipped}`);
  console.log(APPLY ? "Concluído." : "Nada foi alterado (dry-run). Use --apply para aplicar.");
})().catch((err) => {
  console.error("Erro:", err);
  process.exitCode = 1;
});
