# Graphic Designer (Claude Code)

Setup from "Make Claude your Graphic Designer: the 6 steps and every prompt" (charliehills.ai).
Open Claude Code **inside this folder**. If you don't, it never reads CLAUDE.md and ignores your brand.

```
graphic-designer/
  CLAUDE.md                                   Step 1: house rules (done)
  REFERENCE.md                                Step 2: your brand (to do, needs examples/)
  examples/                                   Step 3: 5 graphics you like (to do, add yours)
  .claude/skills/remove-ai-design-slop/       Step 4: design skill (installed)
  before/                                     empty-folder baseline test
```

## Step 2 prompt (run after 5 graphics are in examples/)

```
I am giving you five pieces of design I already like. They are in the examples folder.

Write me one file called REFERENCE.md that any AI can read before it makes anything for me. It must cover:

1. Every colour as a hex code, and what each one is for
2. The fonts, the sizes and the spacing between things
3. Where my name and photo go
4. Five things my brand must never do
5. One example, described in full, of it done right

Ask me about anything you cannot work out from the files.

Show me the file before you save it.
```

## Every graphic (Steps 5–6)

1. `Make 3 versions on [YOUR TOPIC]. Use only my brand. Check each one, then show me.`
2. If they look alike: `Build 3 genuinely different layouts of this graphic. Same words in every one. Show them side by side.`
3. `Polish the one I kept. The title has to read on a phone, nothing tiny, no empty space. Then animate it as a 9-second GIF.`
4. `remove the AI slop from this`
5. `Save [THE ONE YOU PICKED] into the examples folder, so the next graphic starts from it.`

## When something goes wrong

| What you see | Fix |
|---|---|
| "REFERENCE.md doesn't exist" | Normal before Step 2. Run Step 2 |
| Ignores your brand | Claude Code is open in the wrong folder. Reopen it here |
| A colour you never use | Ask "Which line of REFERENCE.md did this colour come from?", then add the missing rule |
| All three look alike | Use the "genuinely different layouts" prompt |
| Text too small on a phone | Run the polish prompt |
| Looks AI-made | "remove the AI slop from this" |
