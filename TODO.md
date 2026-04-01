# Vercel Build Fix TODO

Status: 0/6

- [✅] 1. Create/update TODO.md with steps
- [✅] 2. Update vite.config.ts: Add 'ml' resolve.alias
- [✅] 3. Update src/ui/hooks/useAnalysis.ts: Fix import path to alias
- [✅] 4. Update src/ml/signals/technical_analysis.ts: Relative import reverted for internal ml/ (../models/lstm_model)
- [✅] 5. Test local build: npm run build (SUCCESS ✓ no errors)
- [✅] 6. Test prod server: Ready (npm start after stop dev on port 3000)
- [ ] 7. Git commit & Vercel deploy: `git add . &amp;&amp; git commit -m \"Fix ml model imports for Vercel\" &amp;&amp; vercel --prod`
