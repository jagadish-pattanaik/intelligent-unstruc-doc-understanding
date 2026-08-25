const fs = require('fs');

const appPath = 'c:/Users/HP/OneDrive/Desktop/hackathondell/Intelligent-Unstructured-Document-Understanding/frontend/src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

// 1. Revert How It Works inner ScrollStack
const howItWorksTarget = `            <ScrollStack useWindowScroll={true} itemStackDistance={40} className="mt-10">
              {steps.map((step, idx) => (
                <ScrollStackItem key={idx} itemClassName="!bg-[#0f1923] !p-0 !border !border-white/10 overflow-hidden flex items-center">
                  <div className={\`flex items-center gap-8 md:gap-16 w-full p-8 md:p-12 h-full \${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}\`}>
                    <div className="flex-1">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 transition-all duration-300">
                        <div className="text-sm font-black tracking-[0.15em] uppercase mb-3" style={{ color: step.accentHex }}>{step.num}</div>
                        <h3 className="text-white text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-storm-100/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    {/* Center icon node */}
                    <div className="hidden md:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-[#0f1923] border-2 border-storm-300/30 items-center justify-center z-10 shadow-xl shadow-storm-300/10">
                      <step.icon size={24} style={{ color: step.accentHex }} />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>`;

const howItWorksReplacement = `            <div className="space-y-16 md:space-y-24 mt-10">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={\`flex items-center gap-8 md:gap-16 \${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}\`}
                >
                  <div className="flex-1">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.06] transition-all duration-300">
                      <div className="text-sm font-black tracking-[0.15em] uppercase mb-3" style={{ color: step.accentHex }}>{step.num}</div>
                      <h3 className="text-white text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-storm-100/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center icon node */}
                  <div className="hidden md:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-[#0f1923] border-2 border-storm-300/30 items-center justify-center z-10 shadow-xl shadow-storm-300/10">
                    <step.icon size={24} style={{ color: step.accentHex }} />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>`;

content = content.replace(howItWorksTarget, howItWorksReplacement);

// 2. Wrap Sections
content = content.replace(
  `      {/* ====== HERO SECTION ====== */}`,
  `      <ScrollStack useWindowScroll={true} itemStackDistance={20} innerClassName="pt-0 pb-0 w-full" className="w-full">
      {/* ====== HERO SECTION ====== */}`
);

const wrappers = [
  {
    regex: /\{\/\* ====== HERO SECTION ====== \*\/\}\n\s*<section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20">/g,
    repl: `{/* ====== HERO SECTION ====== */}
      <ScrollStackItem itemClassName="!bg-transparent !p-0 !m-0 !rounded-[40px] !shadow-none !border-0 flex flex-col justify-center relative">
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20">`
  },
  {
    regex: /\{\/\* ====== PIPELINE VISUALIZATION ====== \*\/\}\n\s*<section className="relative z-10 py-24 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== PIPELINE VISUALIZATION ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    regex: /\{\/\* ====== FEATURES BENTO GRID ====== \*\/\}\n\s*<section className="relative z-10 py-24 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== FEATURES BENTO GRID ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    regex: /\{\/\* ====== HOW IT WORKS ====== \*\/\}\n\s*<section className="relative z-10 py-24 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== HOW IT WORKS ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    regex: /\{\/\* ====== STATS BAR ====== \*\/\}\n\s*<section className="relative z-10 py-20 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== STATS BAR ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <section className="relative z-10 py-20 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    regex: /\{\/\* ====== BOTTOM CTA ====== \*\/\}\n\s*<section className="relative z-10 py-32 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== BOTTOM CTA ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <section className="relative z-10 py-32 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    regex: /\{\/\* ====== FOOTER ====== \*\/\}\n\s*<footer className="relative z-10 border-t border-white\/\[0.06\] py-10 px-6">/g,
    repl: `</ScrollStackItem>\n\n      {/* ====== FOOTER ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]\\/95 backdrop-blur-2xl !p-0 !m-0 !rounded-t-[40px] !border-t !border-white\\/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6 min-h-[300px] flex flex-col justify-center">`
  }
];

wrappers.forEach(w => {
  content = content.replace(w.regex, w.repl);
});

// Close the last ScrollStackItem and the ScrollStack at the end of the footer
content = content.replace(
  `            </div>\n          </div>\n        </div>\n      </footer>\n    </div>`,
  `            </div>\n          </div>\n        </div>\n      </footer>\n      </ScrollStackItem>\n      </ScrollStack>\n    </div>`
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Successfully patched App.jsx');
