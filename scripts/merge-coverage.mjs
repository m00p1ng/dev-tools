import { readFileSync, rmSync } from "fs";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const tmpDirs = [".coverage-tmp/unit", ".coverage-tmp/browser"];
const map = libCoverage.createCoverageMap();

for (const dir of tmpDirs) {
  try {
    const json = JSON.parse(readFileSync(`${dir}/coverage-final.json`, "utf8"));
    map.merge(json);
  } catch {
    console.warn(`No coverage found in ${dir}, skipping.`);
  }
}

const context = libReport.createContext({ coverageMap: map, dir: "coverage" });

for (const reporter of ["text", "html"]) {
  reports.create(reporter).execute(context);
}

for (const dir of tmpDirs) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
}
rmSync(".coverage-tmp", { recursive: true, force: true });
