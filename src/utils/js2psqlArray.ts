export const convertJs2psqlArray = (arr: any[]): string => {
  if (!arr || !arr.length) return '';
  let result: string = '(';
  arr.forEach((item: any, index: number) => {
    if (index === arr.length - 1) {
      result += `${item})`;
    } else {
      result += `${item},`;
    }
  });
  return result;
};
