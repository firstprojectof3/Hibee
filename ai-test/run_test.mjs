import fs from "fs";
import path from "path";

function usage() {
  console.log(`
Usage:
  node run_test.mjs --input inputs/checkin_A_day1_step1.json

Options:
  --input <path>           Step1 input JSON file path (required)
  --server <url>           AI server base URL (default: http://localhost:8000)

  --endpoint <path>        Checkin endpoint path (default: /ai/checkin-question)
  --reportEndpoint <path>  Report endpoint path (default: /ai/daily-report)

  --mode <name>            chain | coverage | report (default: chain)
                           - chain: step1 -> step2 -> step3 (1회 경로)
                           - coverage: step1 options 각각을 step1 답변으로 넣어 step2를 N회 호출
                           - report: chain을 먼저 수행해서 step1~3 응답을 만든 뒤, 리포트까지 1회 호출

  --outDir <dir>           Output directory (default: reviews)
`);
}

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function requireArg(name) {
  const v = getArg(name);
  if (!v) {
    console.error(`Missing required arg: ${name}`);
    usage();
    process.exit(1);
  }
  return v;
}

function safeReadText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error(`Failed to read file: ${filePath}`);
    console.error(e.message);
    process.exit(1);
  }
}

function safeReadJson(filePath) {
  const raw = safeReadText(filePath);
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in file: ${filePath}`);
    console.error(e.message);
    process.exit(1);
  }
}

function safeWriteJson(filePath, obj) {
  const absOut = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  fs.writeFileSync(absOut, JSON.stringify(obj, null, 2), "utf-8");
  console.error(`Saved: ${absOut}`);
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Server error: ${res.status} ${res.statusText}`);
    console.error(text);
    process.exit(1);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Server returned non-JSON:");
    console.error(text);
    process.exit(1);
  }
}

// ---- 선택 규칙 (B모드에서 사용): deterministic ----
function pickStep1ValueByMetrics(step1Response, step1Input) {
  const opts = step1Response?.options ?? [];
  const byValue = new Map(opts.map(o => [o.value, o]));

  const m = step1Input?.context?.today_metrics ?? {};
  const late = Number(m?.late_night_minutes ?? 0);
  const maxSession = Number(m?.session_features?.max_session_minutes ?? 0);
  const topSwitch = Number(m?.session_features?.top_switch_pairs?.[0]?.count ?? 0);

  const candidates = [
    late >= 120 ? "late_night_focus" : null,
    maxSession >= 60 ? "long_immersion" : null,
    topSwitch >= 5 ? "sns_game_alt" : null,
    "mixed_pace",
  ].filter(Boolean);

  for (const v of candidates) {
    if (byValue.has(v)) return v;
  }

  return opts[0]?.value ?? null;
}

function makeNextInput(prevInput, nextStep, previousAnswers) {
  return {
    ...prevInput,
    step: nextStep,
    previous_answers: previousAnswers,
  };
}

/** -----------------------------
 * ✅ 리포트 입력 조립
 * - 기존 checkin step1 input의 context에 profile/today_metrics가 이미 있다고 가정
 * - report 서버 스키마가 다르면 여기만 바꾸면 됨
 * ----------------------------- */
function buildReportInputFromChain({ step1Input, prevAnswers }) {
  const profile = step1Input?.context?.user_profile ?? step1Input?.context?.profile ?? null;
  const today = step1Input?.context?.today_metrics ?? null;

  return {
    user_profile: profile,
    today_metrics: today,
    profile_metrics: {
      baseline_available: false
    },
    checkin_answers: {
      completed: true,
      // ✅ 서버가 step별 answer 텍스트를 필요로 한다면, 아래처럼 selected_values 기반으로 기록해도 됨
      // 여기서는 "선택한 값"을 그대로 기록(최소화)
      step1: { selected_values: prevAnswers?.[0]?.selected_values ?? [], free_text: prevAnswers?.[0]?.free_text ?? "" },
      step2: { selected_values: prevAnswers?.[1]?.selected_values ?? [], free_text: prevAnswers?.[1]?.free_text ?? "" },
      step3: { selected_values: prevAnswers?.[2]?.selected_values ?? [], free_text: prevAnswers?.[2]?.free_text ?? "" }
    },
    constraints: {
      source_of_truth: "summary_first",
      raw_is_partial_example: true,
      do_not_recompute_totals_from_raw: true,
      do_not_infer_missing: true
    }
  };
}

/** -----------------------------
 * ✅ 리포트 출력 최소 검증 (통과/실패만)
 * ----------------------------- */
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function len(s) { return (s ?? "").length; }

function validateReportOutput(out) {
  assert(out && typeof out === "object", "report output is not an object");

  assert(typeof out.title === "string", "title missing or not string");
  assert(len(out.title) <= 24, `title too long: ${len(out.title)}`);

  assert(typeof out.summary === "string", "summary missing or not string");
  assert(len(out.summary) <= 220, `summary too long: ${len(out.summary)}`);

  assert(Array.isArray(out.comments), "comments must be array");
  assert(out.comments.length >= 1 && out.comments.length <= 3, `comments length must be 1~3, got ${out.comments.length}`);

  assert(Array.isArray(out.suggestions), "suggestions must be array");
  assert(out.suggestions.length === 1, `suggestions length must be 1, got ${out.suggestions.length}`);

  const s = out.suggestions[0];
  assert(typeof s.title === "string", "suggestions[0].title missing");
  assert(len(s.title) <= 16, `suggestion title too long: ${len(s.title)}`);
  assert(typeof s.description === "string", "suggestions[0].description missing");
  assert(typeof s.why_this === "string", "suggestions[0].why_this missing");
  assert(["easy", "medium", "hard"].includes(s.difficulty), `invalid difficulty: ${s.difficulty}`);

  return true;
}

async function main() {
  const inputPath = requireArg("--input");
  const server = getArg("--server", "http://localhost:8000");
  const endpoint = getArg("--endpoint", "/ai/checkin-question");
  const reportEndpoint = getArg("--reportEndpoint", "/ai/daily-report");
  const mode = getArg("--mode", "chain"); // chain | coverage | report
  const outDir = getArg("--outDir", "reviews");

  const step1Input = safeReadJson(inputPath);

  const checkinUrl = `${server}${endpoint}`;
  const reportUrl = `${server}${reportEndpoint}`;

  // 0) Step1 call
  console.error(`POST ${checkinUrl}`);
  const step1 = await postJson(checkinUrl, step1Input);
  console.log("\n=== STEP1 OUTPUT ===");
  console.log(JSON.stringify(step1, null, 2));

  const baseName = path.basename(inputPath).replace(".json", "");
  safeWriteJson(`${outDir}/${baseName}_step1_output.json`, step1);

  // ---- MODE: coverage ----
  if (mode === "coverage") {
    const opts = step1?.options ?? [];
    if (!opts.length) {
      console.error("No options returned from step1; cannot run coverage mode.");
      process.exit(1);
    }

    for (const opt of opts) {
      const prev = [{
        step: 1,
        selected_values: [opt.value],
        free_text: ""
      }];

      const step2Input = makeNextInput(step1Input, 2, prev);
      const step2 = await postJson(checkinUrl, step2Input);

      console.log(`\n=== STEP2 OUTPUT (selected: ${opt.value}) ===`);
      console.log(JSON.stringify(step2, null, 2));

      safeWriteJson(`${outDir}/${baseName}_step2_selected_${opt.value}.json`, step2);
    }

    return;
  }

  // ---- MODE: chain or report ----
  const picked = pickStep1ValueByMetrics(step1, step1Input);
  if (!picked) {
    console.error("Could not pick a step1 option value.");
    process.exit(1);
  }
  console.error(`Picked step1 value by rule: ${picked}`);

  const prev1 = [{
    step: 1,
    selected_values: [picked],
    free_text: ""
  }];

  // 2) Step2 call
  const step2Input = makeNextInput(step1Input, 2, prev1);
  const step2 = await postJson(checkinUrl, step2Input);
  console.log("\n=== STEP2 OUTPUT ===");
  console.log(JSON.stringify(step2, null, 2));
  safeWriteJson(`${outDir}/${baseName}_step2_output.json`, step2);

  const step2Picked = step2?.options?.[0]?.value ?? null;
  if (!step2Picked) {
    console.error("No options returned from step2; cannot proceed to step3.");
    process.exit(1);
  }
  console.error(`Picked step2 value (first option): ${step2Picked}`);

  const prev2 = [
    ...prev1,
    { step: 2, selected_values: [step2Picked], free_text: "" }
  ];

  // 4) Step3 call
  const step3Input = makeNextInput(step1Input, 3, prev2);
  const step3 = await postJson(checkinUrl, step3Input);
  console.log("\n=== STEP3 OUTPUT ===");
  console.log(JSON.stringify(step3, null, 2));
  safeWriteJson(`${outDir}/${baseName}_step3_output.json`, step3);

  // 여기까지 prevAnswers 구성
  const step3Picked = step3?.options?.[0]?.value ?? null;
  const prev3 = [
    ...prev2,
    { step: 3, selected_values: step3Picked ? [step3Picked] : [], free_text: "" }
  ];

  // ---- MODE: report ----
  if (mode === "report") {
    const reportInput = buildReportInputFromChain({ step1Input, prevAnswers: prev3 });

    console.error(`\nPOST ${reportUrl}`);
    const report = await postJson(reportUrl, reportInput);

    console.log("\n=== REPORT OUTPUT ===");
    console.log(JSON.stringify(report, null, 2));
    safeWriteJson(`${outDir}/${baseName}_report_output.json`, report);

    try {
      validateReportOutput(report);
      console.error("✅ REPORT VALIDATION PASS");
    } catch (e) {
      console.error("❌ REPORT VALIDATION FAIL");
      console.error(e.message);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error("Unexpected error:");
  console.error(e);
  process.exit(1);
});
