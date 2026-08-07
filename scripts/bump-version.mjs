// Bump the patch segment of the version in package.json (1.0.0 -> 1.0.1).
// Runs from the pre-commit git hook so every commit carries a new version.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), "../package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))

const parts = String(pkg.version ?? "0.0.0").split(".")
const major = Number(parts[0]) || 0
const minor = Number(parts[1]) || 0
const patch = (Number(parts[2]) || 0) + 1

pkg.version = `${major}.${minor}.${patch}`
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
console.log(`version bumped to ${pkg.version}`)
