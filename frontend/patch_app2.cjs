const fs = require('fs');

const appPath = 'c:/Users/HP/OneDrive/Desktop/hackathondell/Intelligent-Unstructured-Document-Understanding/frontend/src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

const replacements = [
  {
    target: `      <ScrollStack useWindowScroll={true} itemStackDistance={20} innerClassName="pt-0 pb-0 w-full" className="w-full">
      {/* ====== HERO SECTION ====== */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20">`,
    repl: `      <ScrollStack useWindowScroll={true} itemStackDistance={20} innerClassName="pt-0 pb-0 w-full" className="w-full">
      {/* ====== HERO SECTION ====== */}
      <ScrollStackItem itemClassName="!bg-transparent !p-0 !m-0 !rounded-[40px] !shadow-none !border-0 flex flex-col justify-center relative !h-[100vh]">
      <section className="relative z-10 h-[100vh] flex flex-col items-center justify-center px-6 pt-28 pb-20">`
  },
  {
    target: `        </motion.div>
      </section>

      {/* ====== PIPELINE VISUALIZATION ====== */}
      <section className="relative z-10 py-24 px-6">`,
    repl: `        </motion.div>
      </section>
      </ScrollStackItem>

      {/* ====== PIPELINE VISUALIZATION ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative min-h-screen">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    target: `          </div>
        </div>
      </section>

      {/* ====== FEATURES BENTO GRID ====== */}
      <section className="relative z-10 py-24 px-6">`,
    repl: `          </div>
        </div>
      </section>
      </ScrollStackItem>

      {/* ====== FEATURES BENTO GRID ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative min-h-screen">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    target: `          </motion.div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="relative z-10 py-24 px-6">`,
    repl: `          </motion.div>
        </div>
      </section>
      </ScrollStackItem>

      {/* ====== HOW IT WORKS ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative min-h-screen">
      <section className="relative z-10 py-24 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    target: `          </div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="relative z-10 py-20 px-6">`,
    repl: `          </div>
        </div>
      </section>
      </ScrollStackItem>

      {/* ====== STATS BAR ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative min-h-screen">
      <section className="relative z-10 py-20 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    target: `          </div>
        </div>
      </section>

      {/* ====== BOTTOM CTA ====== */}
      <section className="relative z-10 py-32 px-6">`,
    repl: `          </div>
        </div>
      </section>
      </ScrollStackItem>

      {/* ====== BOTTOM CTA ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923]/95 backdrop-blur-2xl !p-0 !m-0 !rounded-[40px] !border-t !border-white/10 overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative min-h-screen">
      <section className="relative z-10 py-32 px-6 min-h-screen flex flex-col justify-center">`
  },
  {
    target: `          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6">`,
    repl: `          </motion.div>
        </div>
      </section>
      </ScrollStackItem>

      {/* ====== FOOTER ====== */}
      <ScrollStackItem itemClassName="!bg-[#0f1923] !p-0 !m-0 !rounded-[40px] overflow-hidden !shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative">
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6 min-h-[300px] flex flex-col justify-center">`
  },
  {
    target: `          </div>
        </div>
      </footer>

      {/* ====== ONBOARDING MODAL (Get Started) ====== */}`,
    repl: `          </div>
        </div>
      </footer>
      </ScrollStackItem>
      </ScrollStack>

      {/* ====== ONBOARDING MODAL (Get Started) ====== */}`
  }
];

let success = true;
replacements.forEach((r, i) => {
  if (content.includes(r.target)) {
    content = content.replace(r.target, r.repl);
  } else {
    console.error('Failed to find target for replacement chunk', i + 1);
    success = false;
  }
});

if (success) {
  fs.writeFileSync(appPath, content, 'utf8');
  console.log('Successfully patched App.jsx');
} else {
  console.error('Patch aborted due to missing chunks.');
}
