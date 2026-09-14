// Maps Armenian and Russian characters to their Latin equivalents
// used in Yerevan street name romanisation.

const HY: Record<string, string> = {
  ա:"a", բ:"b", գ:"g", դ:"d", ե:"e", զ:"z", է:"e", ը:"e",
  թ:"t", ժ:"zh", ի:"i", լ:"l", խ:"kh", ծ:"ts", կ:"k", հ:"h",
  ձ:"dz", ղ:"gh", ճ:"ch", մ:"m", յ:"y", ն:"n", շ:"sh", ո:"o",
  չ:"ch", պ:"p", ջ:"j", ռ:"r", ս:"s", վ:"v", տ:"t", ր:"r",
  ց:"ts", ւ:"v", փ:"p", ք:"k", օ:"o", ֆ:"f",
};

const RU: Record<string, string> = {
  а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"yo", ж:"zh",
  з:"z", и:"i", й:"y", к:"k", л:"l", м:"m", н:"n", о:"o",
  п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts",
  ч:"ch", ш:"sh", щ:"sh", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya",
};

export function transliterateQuery(q: string): string {
  return q
    .toLowerCase()
    .split("")
    .map((ch) => HY[ch] ?? RU[ch] ?? ch)
    .join("");
}
