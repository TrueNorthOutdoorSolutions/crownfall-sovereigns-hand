// The engine logs in neutral "P1/P2" form (it is shared with the paper simulator).
// In this app the human is always P1, so these turn it into second person for display.
const VERBS: Record<string, string> = {
  keeps: 'keep', shuffles: 'shuffle', deploys: 'deploy', casts: 'cast', sets: 'set', springs: 'spring', moves: 'move',
  ASCENDS: 'ASCEND', goes: 'go', gets: 'get', draws: 'draw', discards: 'discard', does: 'do', chooses: 'choose', breaks: 'break', wins: 'win',
};

export function humanize(text: string): string {
  return text
    .replace(/\bP1's\b/g, 'Your')
    .replace(/\bP2's\b/g, "Rival's")
    .replace(/\bP2\b/g, 'Rival')
    .split(/(?<=[.:!]) /)
    .map((sentence) => {
      if (!/^P1\b/.test(sentence)) return sentence.replace(/\bP1\b/g, 'you');
      return sentence
        .replace(/^P1 (\w+)/, (_m, v: string) => `You ${VERBS[v] ?? v}`)
        .replace(/\band (draws|gets)\b/g, (_m, v: string) => `and ${v.slice(0, -1)}`)
        .replace(/\btheir\b/g, 'your')
        .replace(/\bP1\b/g, 'you');
    })
    .join(' ')
    .replace(/(^|[.!:] )(Your|you)'s\b/g, '$1Your');
}
