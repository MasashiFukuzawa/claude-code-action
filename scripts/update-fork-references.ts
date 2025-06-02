import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const OLD_REFERENCE = "anthropics/claude-code-action@beta";
const NEW_REFERENCE = "MasashiFukuzawa/claude-code-action@orchestrator-alpha";

function updateFile(filePath: string): boolean {
  const content = readFileSync(filePath, "utf-8");
  if (content.includes(OLD_REFERENCE)) {
    const updatedContent = content.replace(
      new RegExp(OLD_REFERENCE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      NEW_REFERENCE,
    );
    writeFileSync(filePath, updatedContent);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  // Get example files
  const exampleFiles = readdirSync("examples")
    .filter((file) => file.endsWith(".yml"))
    .map((file) => join("examples", file));

  const files = ["README.md", ...exampleFiles];

  let updatedCount = 0;
  for (const file of files) {
    if (updateFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Updated ${updatedCount} files`);
}

main().catch(console.error);
