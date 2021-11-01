export const getDisplayName = (name: string) => {
  if (!name) return '';
  const nameList = name.trim().split(' ');
  if (nameList.length === 1) return nameList[0];
  return `${nameList[0]} ${nameList[nameList.length - 1]}`;
};
